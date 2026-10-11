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

    private sealed record SentMail(string To, string Subject, string Body, string? ReplyTo);

    private sealed class FakeSender(bool failForAdmin = false) : IEmailSender
    {
        public List<SentMail> Sent { get; } = [];

        public Task SendAsync(string to, string subject, string body, bool isHtml = false, string? replyTo = null)
        {
            if (failForAdmin && to == Admin)
                throw new InvalidOperationException("SMTP nere");
            Sent.Add(new SentMail(to, subject, body, replyTo));
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
        Assert.Contains($"{4500m:N0} kr", admin.Body);
        Assert.Contains($"/snickerier/{Hammock.Id}", admin.Body);
        Assert.Equal("anna@example.se", admin.ReplyTo);
    }

    [Fact]
    public void Namnet_i_bekräftelsen_blir_en_rad()
    {
        var mail = EmailTemplate.BookingConfirmation("Anna\n\nKlicka här: http://bluff.example");
        Assert.Contains("Hej Anna Klicka här: http://bluff.example,", mail);
        Assert.Equal(100, EmailTemplate.OneLine(new string('a', 500)).Length);
    }
}
