using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Models.Booking;
using Models.Mail;
using Models.Snickeri;
using Services.Src.Mail;

namespace Tests;

public class EmailServiceTests
{
    private const string Admin = "terry@example.se";

    private sealed record SentMail(string To, string Subject, MailContent Content, string? ReplyTo);

    private sealed class FakeSender(bool failForAdmin = false) : IEmailSender
    {
        public List<SentMail> Sent { get; } = [];

        public Task SendAsync(string to, string subject, MailContent content, string? replyTo = null)
        {
            if (failForAdmin && to == Admin)
                throw new InvalidOperationException("SMTP nere");
            Sent.Add(new SentMail(to, subject, content, replyTo));
            return Task.CompletedTask;
        }
    }

    private static EmailService Service(FakeSender sender) => new(
        sender,
        Options.Create(new SmtpSettings
        {
            Host = "smtp", Port = 587, UserName = "u", Password = "p",
            From = "noreply@example.se", AdminTo = Admin,
        }),
        NullLogger<EmailService>.Instance);

    private static BookingRequest Booking() => new()
    {
        Name = "Anna", Email = "anna@example.se", Placement = "utomhus", Project = "bastu",
        Address = "Storgatan 1, Kivik", Description = "En bastu", PrivacyAccepted = true,
    };

    private static readonly DetailedSnickeri Hammock = new()
    {
        Id = Guid.NewGuid(), Title = "Hammock", Description = "Lärk", Price = 4500, Images = [],
    };

    [Fact]
    public async Task Adminmejlet_har_kunden_som_svarsadress()
    {
        var sender = new FakeSender();
        await Service(sender).SendBookingEmailsAsync(Booking());

        var admin = Assert.Single(sender.Sent, m => m.To == Admin);
        Assert.Equal("anna@example.se", admin.ReplyTo);
        Assert.Contains(sender.Sent, m => m.To == "anna@example.se");
    }

    [Fact]
    public async Task Misslyckat_adminmejl_ger_fel_och_ingen_bekräftelse()
    {
        var sender = new FakeSender(failForAdmin: true);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => Service(sender).SendBookingEmailsAsync(Booking()));
        Assert.Empty(sender.Sent);
    }

    [Fact]
    public async Task Snickeriförfrågan_använder_titel_och_pris_från_databasen()
    {
        var sender = new FakeSender();
        var inquiry = new SnickeriInquiryRequest
        {
            SnickeriId = Hammock.Id, Name = "Anna", Email = "anna@example.se", PrivacyAccepted = true,
        };

        await Service(sender).SendSnickeriInquiryAsync(inquiry, Hammock);

        var admin = Assert.Single(sender.Sent, m => m.To == Admin);
        Assert.Contains("Hammock", admin.Subject);
        Assert.Contains(EmailTemplate.Price(4500), admin.Content.Text);
        Assert.Contains($"/snickerier/{Hammock.Id}", admin.Content.Html);
        Assert.Equal("anna@example.se", admin.ReplyTo);
    }

    [Fact]
    public void Namnet_i_bekräftelsen_blir_en_rad()
    {
        Assert.Equal("Anna Klicka här", EmailTemplate.OneLine("Anna\n\nKlicka   här"));
        Assert.Equal(100, EmailTemplate.OneLine(new string('a', 500)).Length);

        // Rubriken använder bara förnamnet — inga länkar eller långa texter
        var mail = EmailTemplate.BookingConfirmation("Anna\nKlicka här: http://bluff.example");
        Assert.Contains("Tack för din förfrågan, Anna!", mail.Text);
        Assert.DoesNotContain("bluff.example", mail.Html);
    }

    [Fact]
    public void Kunddata_HTML_kodas_i_mejlet()
    {
        var booking = Booking();
        booking.Description = "<script>alert(1)</script>\nRad två";

        var mail = EmailTemplate.BookingAdmin(booking);

        Assert.DoesNotContain("<script>", mail.Html);
        Assert.Contains("&lt;script&gt;", mail.Html);
        Assert.Contains("<br>Rad två", mail.Html);      // radbrytningar behålls
        Assert.Contains("<script>", mail.Text);          // textversionen är ren text
    }

    [Fact]
    public void Pris_formateras_på_svenska_oavsett_serverns_kultur()
    {
        var old = System.Globalization.CultureInfo.CurrentCulture;
        try
        {
            System.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo("en-US");
            Assert.Equal("4\u00a0500 kr", EmailTemplate.Price(4500));
        }
        finally { System.Globalization.CultureInfo.CurrentCulture = old; }
    }

    [Fact]
    public void Inbjudan_har_knapp_och_giltighetstid()
    {
        var mail = EmailTemplate.AdminInvite("https://terrysallbygg.se/admin/accept-invite?token=abc", 1);
        Assert.Contains("href=\"https://terrysallbygg.se/admin/accept-invite?token=abc\"", mail.Html);
        Assert.Contains("1 timme", mail.Text);
    }

    [Fact]
    public void Token_sparas_som_hash()
    {
        var hash = Services.Src.Auth.UserManagementService.HashToken("abc");
        Assert.Equal(64, hash.Length);
        Assert.NotEqual("abc", hash);
        Assert.Equal(hash, Services.Src.Auth.UserManagementService.HashToken("abc"));
    }
}
