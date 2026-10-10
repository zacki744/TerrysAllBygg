// src/pages/Privacy.tsx
// ── Integritetspolicy (GDPR art. 13) ──────────────────────
// Beskriver den faktiska behandlingen i koden:
//   • Formulären (Book, Snickeri) → e-post till admin + bekräftelse, ingen DB-lagring
//   • Serverloggar (Serilog) sparas PRIVACY.logRetentionDays dagar
//   • Inga cookies för besökare; endast nödvändig cookie för admin-inloggning
// Ändras flödet ska texten och PRIVACY.lastUpdated uppdateras.

import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import { CONTACT } from "../lib/contact";
import { PRIVACY } from "../lib/privacy";
import styles from "../pages.module.css";

const lastUpdated = new Date(PRIVACY.lastUpdated).toLocaleDateString("sv-SE", {
  year: "numeric", month: "long", day: "numeric",
});

export default function Privacy() {
  return (
    <PageShell>
      <PageMeta
        title="Integritetspolicy"
        description="Så behandlar Terrys Allbygg dina personuppgifter när du skickar en förfrågan via webbplatsen."
        canonical={PRIVACY.path}
      />

      <header className={styles.aboutHeader}>
        <h1 className={styles.pageTitle}>Integritetspolicy</h1>
        <p className={styles.pageSubtitle}>
          Kort och tydligt om hur vi hanterar dina uppgifter. Senast uppdaterad {lastUpdated}.
        </p>
      </header>

      <div className={styles.privacyBody}>

        <section>
          <h2 className={styles.privacyTitle}>Vem ansvarar för dina uppgifter?</h2>
          <p>
            {CONTACT.companyName} är personuppgiftsansvarig för de uppgifter som
            behandlas via den här webbplatsen.
          </p>
          <ul className={styles.privacyFacts}>
            {CONTACT.orgNumber && <li>Organisationsnummer: {CONTACT.orgNumber}</li>}
            {CONTACT.address && <li>Adress: {CONTACT.address}</li>}
            <li>E-post: <a href={CONTACT.emailHref}>{CONTACT.email}</a></li>
            <li>Telefon: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
          </ul>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Vilka uppgifter samlar vi in?</h2>
          <p>Bara det du själv skriver in när du skickar en förfrågan:</p>
          <ul>
            <li>
              <strong>Konsultationsförfrågan:</strong> namn, e-post, telefonnummer (valfritt),
              adress där projektet ska utföras, typ av projekt och din beskrivning.
            </li>
            <li>
              <strong>Förfrågan om snickeri:</strong> namn, e-post, telefonnummer (valfritt),
              ditt meddelande och vilken produkt det gäller.
            </li>
          </ul>
          <p>
            Skriv inte känsliga uppgifter, till exempel om hälsa, i fritextfälten. Det behövs
            inte för att vi ska kunna hjälpa dig.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Varför och med vilken rätt?</h2>
          <ul>
            <li>
              <strong>Besvara din förfrågan och lämna offert.</strong> Rättslig grund: åtgärder
              på din begäran innan ett avtal ingås (GDPR art. 6.1 b).
            </li>
            <li>
              <strong>Utföra ett uppdrag</strong> om vi kommer överens. Rättslig grund: avtal
              (art. 6.1 b).
            </li>
            <li>
              <strong>Bokföring</strong> av fakturor och avtal. Rättslig grund: rättslig
              förpliktelse enligt bokföringslagen (art. 6.1 c).
            </li>
            <li>
              <strong>Säkerhet och felsökning</strong> av webbplatsen genom tekniska loggar.
              Rättslig grund: berättigat intresse (art. 6.1 f).
            </li>
          </ul>
          <p>
            Vi använder inte uppgifterna för nyhetsbrev, marknadsföring eller automatiserade
            beslut, och vi säljer dem aldrig.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Så hanteras förfrågan</h2>
          <p>
            När du skickar formuläret skickas uppgifterna som ett e-postmeddelande till oss och
            du får en bekräftelse till din e-post. Webbplatsen sparar inte förfrågan i någon
            databas. Uppgifterna finns därefter i vår e-postinkorg.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Hur länge sparas uppgifterna?</h2>
          <ul>
            <li>
              Förfrågningar som inte leder till ett uppdrag raderas senast{" "}
              {PRIVACY.inquiryRetentionMonths} månader efter vår senaste kontakt.
            </li>
            <li>
              Leder förfrågan till ett uppdrag sparas uppgifterna så länge uppdraget och
              eventuella garantiåtaganden pågår. Bokföringsunderlag sparas i sju år enligt lag.
            </li>
            <li>
              Tekniska serverloggar raderas automatiskt efter {PRIVACY.logRetentionDays} dagar.
              E-postadresser maskeras i loggarna.
            </li>
          </ul>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Vilka får ta del av uppgifterna?</h2>
          <p>Bara vi, och de leverantörer som behövs för att webbplatsen och e-posten ska fungera:</p>
          <ul>
            <li>
              <strong>Simply.com</strong> – webbhotell och e-postserver (inom EU). Servern
              behandlar tekniska uppgifter som IP-adress när du besöker webbplatsen.
            </li>
            <li>
              <strong>Google (Gmail)</strong> – vår e-postinkorg. Google kan överföra uppgifter
              till USA med stöd av EU:s ramverk för dataskydd (EU–US Data Privacy Framework)
              och EU-kommissionens standardavtalsklausuler.
            </li>
          </ul>
          <p>
            Leverantörerna behandlar uppgifterna enligt personuppgiftsbiträdesavtal och får inte
            använda dem för egna syften.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Cookies</h2>
          <p>
            Webbplatsen använder inga cookies för analys, spårning eller marknadsföring och
            laddar inget innehåll från tredje part. Därför behövs ingen cookiebanner.
          </p>
          <p>
            Endast inloggade administratörer får en cookie, som krävs för att inloggningen ska
            fungera. Sådana nödvändiga cookies kräver inte samtycke enligt lagen om elektronisk
            kommunikation.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Säkerhet</h2>
          <p>
            All trafik är krypterad (HTTPS), formulären är skyddade mot massutskick och endast
            behöriga administratörer har tillgång till webbplatsens administration.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Dina rättigheter</h2>
          <p>Du har rätt att:</p>
          <ul>
            <li>få veta vilka uppgifter vi har om dig och få en kopia (registerutdrag)</li>
            <li>få felaktiga uppgifter rättade</li>
            <li>få dina uppgifter raderade, om vi inte måste spara dem enligt lag</li>
            <li>begära att behandlingen begränsas eller invända mot den</li>
            <li>få ut uppgifter du lämnat i ett maskinläsbart format (dataportabilitet)</li>
          </ul>
          <p>
            Kontakta oss på <a href={CONTACT.emailHref}>{CONTACT.email}</a>. Vi svarar inom en
            månad. Är du missnöjd med hur vi hanterar dina uppgifter kan du lämna klagomål till
            Integritetsskyddsmyndigheten (IMY),{" "}
            <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">imy.se</a>.
          </p>
        </section>

        <section>
          <h2 className={styles.privacyTitle}>Ändringar</h2>
          <p>
            Vi uppdaterar policyn om vi ändrar hur uppgifter behandlas. Datumet högst upp visar
            när den senast ändrades.
          </p>
        </section>

      </div>
    </PageShell>
  );
}
