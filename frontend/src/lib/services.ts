// src/lib/services.ts
// ══════════════════════════════════════════════════════════
// Enda listan över tjänster. Används på tjänstesidorna (/tjanster/…),
// startsidan, Om oss, i sitemap/förrendering och i strukturerad data.
//
// Texterna ska vara sanna för Terrys Allbygg — inga påhittade siffror,
// priser eller garantier. Bygglovsuppgifterna är medvetet allmänna;
// det exakta avgörs alltid av kommunen.
// ══════════════════════════════════════════════════════════

export interface Service {
  slug: string;              // adressen: /tjanster/<slug>. Ändras inte efter att tjänsten skapats.
  name: string;              // kort namn (menyer, listor, bokningsformuläret)
  detail: string;            // komplettering i listor: "Bastuer utomhus och inomhus"
  title: string;             // h1 på tjänstesidan
  description: string;       // meta description, högst ca 160 tecken
  intro: string;             // stycken överst på sidan (tom rad = nytt stycke)
  includes: string[];        // "Det här kan vi hjälpa till med"
  goodToKnow: string;        // ruta med praktisk info (bygglov m.m.)
}

// Standardlistan. Terry ändrar tjänsterna i admin → Tjänster; det som sparas
// där ersätter den här listan (se services i lib/settings.ts).
export const DEFAULT_SERVICES: Service[] = [
  {
    slug: "bastu",
    name: "Bastuer",
    detail: "utomhus och inomhus",
    title: "Bastu – utomhus och inomhus",
    description: "Vi bygger bastuer på Österlen: fristående utomhusbastu, bastu i befintligt hus eller bastu med altan. Kostnadsfri konsultation i Simrishamn, Tomelilla och Ystad.",
    intro:
      "En egen bastu är ett av de roligaste projekten vi bygger. Vi tar fram en lösning som passar din tomt eller ditt hus – en fristående utomhusbastu, en bastu i ett befintligt rum eller en bastu ihop med altan och dusch.\n\n" +
      "Vi hjälper dig med storlek, placering, aggregat och material, och bygger hela vägen från grund till färdig lav.",
    includes: [
      "Fristående utomhusbastu, med eller utan omklädningsrum",
      "Bastu inbyggd i befintligt hus eller källare",
      "Val av aggregat – vedeldat eller el",
      "Panel, lavar och detaljer i trä som tål värme och fukt",
      "Altan, trall eller uteplats i anslutning till bastun",
    ],
    goodToKnow: "En fristående bastu kan ofta byggas som friggebod (högst 15 m²) eller som attefallshus (högst 30 m², kräver anmälan). Vad som gäller beror på storlek, placering och detaljplan – vi hjälper dig att ta reda på det innan bygget börjar. Ett elaggregat ska anslutas av en behörig elektriker.",
  },
  {
    slug: "tillbyggnad",
    name: "Tillbyggnader",
    detail: "och ombyggnationer",
    title: "Tillbyggnad och ombyggnad",
    description: "Tillbyggnad av hus på Österlen – extra rum, större kök, inglasat uterum eller ombyggnad av befintliga ytor. Vi hjälper dig från idé till färdigt bygge.",
    intro:
      "Behöver huset mer plats? En tillbyggnad ger ett extra sovrum, ett större kök eller ett uterum utan att du behöver flytta. Vi bygger också om befintliga ytor när planlösningen inte längre fungerar.\n\n" +
      "Vi går igenom vad du vill uppnå, hur tillbyggnaden ska möta det befintliga huset och vad som behövs i form av bygglov eller anmälan.",
    includes: [
      "Tillbyggnad med nytt rum, uterum eller entré",
      "Attefallstillbyggnad",
      "Ombyggnad och ny planlösning i befintligt hus",
      "Stomme, tak, fasad och invändiga ytskikt",
      "Samordning med el, VVS och andra hantverkare vid behov",
    ],
    goodToKnow: "En tillbyggnad kräver i regel bygglov. En mindre tillbyggnad på högst 15 m² kan ibland göras som attefallstillbyggnad med anmälan i stället. Arbete på ett befintligt bostadshus kan ge rätt till ROT-avdrag på arbetskostnaden.",
  },
  {
    slug: "altaner",
    name: "Altaner",
    detail: "och uteplatser",
    title: "Altan och uteplats",
    description: "Altaner, trädäck och uteplatser på Österlen – med pergola, tak, räcke eller trappa. Byggda för att klara skånskt väder. Kostnadsfri konsultation.",
    intro:
      "En väl byggd altan blir husets extra rum på sommaren. Vi bygger altaner och trädäck i alla storlekar – från en liten uteplats vid köksdörren till en stor altan i flera nivåer.\n\n" +
      "Grunden avgör hur länge altanen håller, så vi lägger stor vikt vid plintar, bärlinor och dränering innan trallen läggs.",
    includes: [
      "Altan och trädäck i tryckimpregnerat, lärk eller annat virke",
      "Pergola, skärmtak eller altantak",
      "Räcken, trappor och ramper",
      "Uteplatser i flera nivåer",
      "Renovering eller byte av gammal altan",
    ],
    goodToKnow: "En altan kräver oftast inget bygglov, men höjd över marken, tak och avstånd till tomtgränsen kan göra att det behövs. Vi hjälper dig att kontrollera vad som gäller för din tomt.",
  },
  {
    slug: "forrad-och-garage",
    name: "Förråd och garage",
    detail: "",
    title: "Förråd, garage och carport",
    description: "Förråd, friggebod, garage och carport på Österlen. Vi bygger efter dina mått och hjälper dig med vad som gäller för bygglov eller anmälan.",
    intro:
      "Ett förråd eller garage som är byggt för just dina saker gör vardagen enklare. Vi bygger allt från små redskapsbodar till dubbelgarage och carportar.\n\n" +
      "Vi anpassar storlek, dörrar och fönster efter hur byggnaden ska användas, och ser till att den passar ihop med huset och tomten.",
    includes: [
      "Förråd och friggebodar",
      "Garage och carport",
      "Vedbodar och redskapsbodar",
      "Grund, stomme, tak och fasad",
      "Ombyggnad av befintligt förråd eller garage",
    ],
    goodToKnow: "En friggebod på högst 15 m² kräver i regel varken bygglov eller anmälan. Ett attefallshus upp till 30 m² kräver anmälan, och större garage kräver oftast bygglov. Vi hjälper dig att ta reda på vad som gäller.",
  },
  {
    slug: "tradgardsstudio",
    name: "Trädgårdsstudios",
    detail: "och gästhus",
    title: "Trädgårdsstudio och gästhus",
    description: "Trädgårdsstudio, ateljé eller gästhus på tomten – byggt som friggebod eller attefallshus. Lokal byggfirma på Österlen med kostnadsfri konsultation.",
    intro:
      "En trädgårdsstudio ger plats för hemmakontor, ateljé, gym eller övernattande gäster – utan att bygga om huset. Vi bygger studios och gästhus som är isolerade och går att använda året runt.\n\n" +
      "Tillsammans tar vi fram en planlösning med rätt fönster, ljusinsläpp och förvaring för det du ska använda huset till.",
    includes: [
      "Isolerad trädgårdsstudio för året runt-bruk",
      "Gästhus och attefallshus",
      "Ateljé, hemmakontor eller gym",
      "Fönster, dörrar, ytskikt och inredningssnickerier",
      "Altan eller uteplats i anslutning till huset",
    ],
    goodToKnow: "Ett attefallshus på högst 30 m² kan användas som bostad (komplementbostadshus) och kräver anmälan till kommunen men inget bygglov. Mindre studios kan byggas som friggebod på högst 15 m².",
  },
  {
    slug: "snickerier",
    name: "Snickerier",
    detail: "skräddarsydda, framför allt utomhusmöbler",
    title: "Snickerier på beställning",
    description: "Skräddarsydda snickerier och utemöbler i trä från Österlen – bänkar, bord, hammockställningar och detaljer efter dina mått.",
    intro:
      "Utöver byggprojekt tillverkar vi snickerier på beställning – framför allt utomhusmöbler och detaljer i trä som håller i många år.\n\n" +
      "Du kan beställa något av det vi redan har gjort, eller berätta vad du behöver så tar vi fram ett förslag efter dina mått och önskemål.",
    includes: [
      "Utemöbler: bänkar, bord, soffor och hammockställningar",
      "Staket och grindar",
      "Utedusch, planteringsbord och planteringslådor",
      "Inredningssnickerier och hyllor",
      "Detaljer till altan, bastu och trädgård",
      "Specialbeställningar efter ritning eller idé",
    ],
    goodToKnow: "Färdiga snickerier med pris hittar du under Snickerier. Beställer du något eget ger vi dig ett pris innan vi börjar.",
  },
  {
    slug: "renovering",
    name: "Renoveringar",
    detail: "",
    title: "Renovering",
    description: "Renovering av hus och fritidshus på Österlen – fasad, fönster, golv, tak och invändiga ytor. ROT-avdrag kan gälla arbetskostnaden.",
    intro:
      "Äldre hus på Österlen har ofta mycket charm – och en del som behöver göras om. Vi renoverar invändigt och utvändigt, och försöker bevara det som är värt att spara.\n\n" +
      "Vi börjar med att gå igenom huset tillsammans med dig, så att du vet vad som behöver göras och i vilken ordning.",
    includes: [
      "Fasad, panel och målning",
      "Byte av fönster och dörrar",
      "Golv, väggar och innertak",
      "Tak – reparation och byte",
      "Renovering av fritidshus och sommarstugor",
      "Mindre reparationer och underhåll",
    ],
    goodToKnow: "Arbetskostnaden för renovering av ett befintligt bostadshus kan ge rätt till ROT-avdrag. Fasadändringar kan i vissa områden kräva bygglov – särskilt i kulturmiljöer, som det finns många av på Österlen.",
  },
];

export const servicePath = (slug: string) => `/tjanster/${slug}`;
export const SERVICES_PATH = "/tjanster";

export const findService = (services: readonly Service[], slug: string | null | undefined) =>
  slug ? services.find((s) => s.slug === slug) : undefined;

/** Projekt med etiketten för en tjänst (etiketten sätts i projektformuläret). */
export function projectsForService<T extends { service?: string | null }>(service: Service, projects: T[]): T[] {
  return projects.filter((p) => p.service === service.slug);
}

/** Kontroll innan tjänsterna sparas i admin (servern kontrollerar samma sak). */
export function validateServices(services: readonly { name: string; slug: string }[]): string | null {
  const seen = new Set<string>();
  for (const s of services) {
    if (!s.name.trim()) return "Alla tjänster behöver ett namn.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) return `"${s.name}": adressen får bara innehålla a–z, 0–9 och bindestreck.`;
    if (seen.has(s.slug)) return `Två tjänster har samma adress (/tjanster/${s.slug}).`;
    seen.add(s.slug);
  }
  return null;
}

// ── Förslag i admin ────────────────────────────────────────
// När ett projekt saknar etikett föreslår formuläret en tjänst utifrån
// titeln. Används bara som förslag — sajten visar bara satta etiketter.
const SUGGEST_KEYWORDS: Record<string, RegExp> = {
  "bastu": /bastu/i,
  "tillbyggnad": /tillbyggnad|ombyggnad|uterum|inglasa/i,
  "altaner": /altan|trall|trädäck|uteplats|pergola|däck/i,
  "forrad-och-garage": /förråd|garage|carport|friggebod|vedbod|bod\b/i,
  "tradgardsstudio": /studio|gästhus|attefall|ateljé|lusthus/i,
  "snickerier": /snickeri|möbel|möbler|bänk|bord|hammock|grind|staket|utedusch|plantering/i,
  "renovering": /renover|repar|reper|fasad|fönster|dörr|golv|\btak\b|takläggning|takbyte|målning|måla|målat/i,
};

const stem = (text: string) => text.toLowerCase().normalize("NFC").slice(0, Math.max(4, text.length - 2));

export function suggestService(services: readonly Service[], title: string, description = ""): Service | undefined {
  const matches = (s: Service, text: string) =>
    SUGGEST_KEYWORDS[s.slug]?.test(text) || (text.toLowerCase().includes(stem(s.name)));
  return services.find((s) => matches(s, title)) ?? services.find((s) => matches(s, description));
}

/** Arbetsgång — samma för alla tjänster. */
export const PROCESS = [
  { title: "Kostnadsfri konsultation", text: "Vi träffas på plats eller pratar i telefon om vad du vill bygga, hur det ska användas och vad du har tänkt dig i budget." },
  { title: "Förslag och offert",       text: "Du får ett förslag med material, tidsplan och pris. Vi hjälper dig också att reda ut om det behövs bygglov eller anmälan." },
  { title: "Bygget",                   text: "Vi bygger och håller dig uppdaterad under arbetet. Ändringar stämmer vi av med dig innan de görs." },
  { title: "Genomgång",                text: "När allt är klart går vi igenom resultatet tillsammans, så att du vet att allt blev som du ville." },
] as const;

/** Orter i texterna. */
export const AREA_TEXT = "Simrishamn, Tomelilla, Ystad och resten av Österlen";
