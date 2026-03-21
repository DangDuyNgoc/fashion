using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

public class EmailSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
    public string From { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class EmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IConfiguration config)
    {
        _settings = config.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings();

        // Ensure a valid From address is set to avoid runtime errors.
        if (string.IsNullOrWhiteSpace(_settings.From))
            _settings.From = string.IsNullOrWhiteSpace(_settings.Username)
                ? "noreply@localhost"
                : _settings.Username;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
            throw new InvalidOperationException("Email host is not configured. Please set Email:Host in configuration.");

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_settings.From));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart("html")
        {
            Text = $@"
                <h3>{subject}</h3>
                <p>{body}</p>
            "
        };

        using var client = new SmtpClient();
        client.Timeout = 10000;

        SecureSocketOptions socketOptions;

        if (_settings.UseSsl)
        {
            socketOptions = _settings.Port == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;
        }
        else
        {
            socketOptions = SecureSocketOptions.None;
        }

        try
        {
            await client.ConnectAsync(_settings.Host, _settings.Port, socketOptions);

            if (!string.IsNullOrWhiteSpace(_settings.Username))
                await client.AuthenticateAsync(_settings.Username, _settings.Password);

            await client.SendAsync(email);
        }
        catch (Exception ex)
        {
            throw new Exception("Email send failed: " + ex.Message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
        }
}
