-- Etikett på projekt: vilken tjänst projektet hör till (admin → Tjänster).
-- Körs en gång i Simplys phpMyAdmin innan den nya versionen deployas.
-- Utan kolumnen går det inte att spara projekt.
-- (Får du felet "Duplicate column name" är kolumnen redan skapad.)

ALTER TABLE projects ADD COLUMN service VARCHAR(60) NULL;
