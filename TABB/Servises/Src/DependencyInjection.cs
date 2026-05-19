using Microsoft.Extensions.DependencyInjection;
using Services.Src.Auth;
using Services.Src.DB;
using Services.Src.Mail;

namespace Services.Src;

public static class DependencyInjection
{
    public static IServiceCollection AddServiceLayer(this IServiceCollection services)
    {
        // DB
        services.AddSingleton<IDbConnectionFactory, MySqlConnectionFactory>();
        services.AddScoped<IDatabase, MySqlDatabase>();

        // Auth
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();

        // Mail
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        // Projects & Snickerier
        services.AddScoped<Projects.IProjectsService, Projects.ProjectsService>();
        services.AddScoped<Snickerier.ISnickeriService, Snickerier.SnickeriService>();

        return services;
    }
}