using Models.Booking;

namespace Services.Src.Mail;

public static class EmailTemplate
{
    public static string BookingAdmin(BookingRequest b) => $@"
        New booking request

        Name: {b.Name}
        Email: {b.Email}
        Phone: {b.PhoneNumber}
        Project: {b.Project}
        Address: {b.Address}

        Description:
        {b.Description}
    ";

    public static string BookingConfirmation(string name) => $@"
        Hi {name},

        Thank you for contacting BuildCo!
        We have received your booking request and will get back to you shortly.

        Regards,
        BuildCo
    ";
}

