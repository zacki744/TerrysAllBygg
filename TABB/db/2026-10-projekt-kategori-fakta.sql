-- Projekt: kategori (etikett) och valfria fakta som visas på projektsidan.
-- Körs en gång i Simplys phpMyAdmin innan den nya versionen deployas,
-- efter site_settings.sql. Utan kolumnerna går det inte att spara projekt.
--
-- Har du kört den äldre filen 2026-10-projekt-tjanst.sql (kolumnen
-- "service") kan den tas bort först:  ALTER TABLE projects DROP COLUMN service;

ALTER TABLE projects
    ADD COLUMN category VARCHAR(60)  NULL,   -- slug, se admin → Inställningar → Kategorier
    ADD COLUMN location VARCHAR(100) NULL,   -- ort, t.ex. "Kivik"
    ADD COLUMN `year`   SMALLINT     NULL,   -- år då projektet gjordes
    ADD COLUMN scope    VARCHAR(100) NULL;   -- omfattning, t.ex. "6 veckor"
