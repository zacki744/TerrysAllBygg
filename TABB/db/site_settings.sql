-- Webbplatsinställningar (admin → Inställningar).
-- Körs en gång i Simplys phpMyAdmin innan den nya versionen deployas.
-- Tabellen har en enda rad (id = 1) med alla inställningar som JSON.
-- Utan tabellen visar sajten standardvärdena, men inget går att spara.

CREATE TABLE IF NOT EXISTS site_settings (
    id      INT        NOT NULL PRIMARY KEY,
    data    MEDIUMTEXT NOT NULL,
    updated DATETIME   NOT NULL
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
