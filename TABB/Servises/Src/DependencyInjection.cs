using Microsoft.Extensions.DependencyInjection;
using Services.Src.DB;
using Services.Src.Auth;

namespace Services.Src
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddServiceLayer(this IServiceCollection services)
        {
            services.AddScoped<Projects.IProjectsService, Projects.ProjectsService>();
            services.AddScoped<Mail.IEmailService, Mail.EmailService>();
            services.AddScoped<Mail.IEmailSender, Mail.SmtpEmailSender>();
            services.AddScoped<IAuthService, AuthService>();

            services.AddSingleton<IDbConnectionFactory, MySqlConnectionFactory>();
            services.AddScoped<IDatabase, MySqlDatabase>();

            return services;
        }
    }
}