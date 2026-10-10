using System.ComponentModel.DataAnnotations;
using Models.Booking;
using Models.Snickeri;
using Services.Src.Mail;

namespace Tests;

public class ModelValidationTests
{
    private static List<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);
        return results;
    }

    private static BookingRequest Booking(bool privacyAccepted) => new()
    {
        Name = "Anna",
        Email = "anna@example.se",
        Placement = "utomhus",
        Project = "bastu",
        Address = "Storgatan 1, Kivik",
        Description = "En bastu",
        PrivacyAccepted = privacyAccepted,
    };

    [Fact]
    public void Bokning_utan_bekräftad_integritetspolicy_är_ogiltig()
    {
        var errors = Validate(Booking(privacyAccepted: false));
        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(BookingRequest.PrivacyAccepted)));
    }

    [Fact]
    public void Bokning_med_bekräftad_integritetspolicy_är_giltig()
        => Assert.Empty(Validate(Booking(privacyAccepted: true)));

    [Fact]
    public void Snickeriförfrågan_kräver_giltig_epost_och_bekräftelse()
    {
        var inquiry = new SnickeriInquiryRequest
        {
            SnickeriId = "1", SnickeriTitle = "Bänk", SnickeriPrice = 4500,
            Name = "Anna", Email = "inte-en-adress", PrivacyAccepted = false,
        };

        var members = Validate(inquiry).SelectMany(e => e.MemberNames).ToList();
        Assert.Contains(nameof(SnickeriInquiryRequest.Email), members);
        Assert.Contains(nameof(SnickeriInquiryRequest.PrivacyAccepted), members);
    }

    [Fact]
    public void Adminmejlet_tar_med_specificerad_plats_och_projekttyp()
    {
        var booking = Booking(true);
        booking.Placement = "annat";
        booking.Other1 = "Bakom ladan";
        booking.Project = "annat";
        booking.Other2 = "Hönshus";

        var mail = EmailTemplate.BookingAdmin(booking);

        Assert.Contains("annat – Bakom ladan", mail);
        Assert.Contains("annat – Hönshus", mail);
    }

    [Fact]
    public void Bekräftelsemejlet_länkar_till_integritetspolicyn()
        => Assert.Contains("https://terrysallbygg.se/integritetspolicy", EmailTemplate.BookingConfirmation("Anna"));
}
