using Models.Booking;
namespace Services.Src.Mail;

public static class EmailTemplate
{
    public static string BookingAdmin(BookingRequest b) => $@"
        Ny konsultationsförfrågan – Terrys All Bygg

        Namn: {b.Name}
        E-post: {b.Email}
        Telefon: {b.PhoneNumber}
        Projekt: {b.Project}
        Adress: {b.Address}

        Beskrivning:
        {b.Description}

        Meddelandet skickades: {DateTime.Now:yyyy-MM-dd HH:mm}
    ";

    public static string BookingConfirmation(string name) => $@"
        Hej {name},

        Tack för att du har skickat en konsultationsförfrågan till Terrys All Bygg.

        Vi har nu mottagit din förfrågan och kommer att kontakta dig så snart som möjligt, vanligtvis inom 1–2 arbetsdagar.

        Om ditt ärende är brådskande är du välkommen att kontakta oss direkt via telefon.

        Med vänliga hälsningar,  
        Terrys All Bygg  
        E-post: info@terrysallbygg.se  
        Telefon: 07X-XXX XX XX
    ";
}
