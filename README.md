# VZTM Kielce

Strona firmowa wirtualnego przewoznika OMSI VZTM Kielce. Projekt przedstawia dwa oddzialy:

- VMPK Kielce
- VBP Tour Regio Kielce

## Uruchomienie

Wymagany jest Node.js 20 lub nowszy.

W PowerShell uruchamiaj polecenia przez `npm.cmd`, aby ominąć blokadę skryptu `npm.ps1`:

```powershell
npm.cmd install
npm.cmd run dev
```

W drugim terminalu uruchom API logowania i rekrutacji:

```powershell
npm.cmd run api
```

Następnie otwórz `http://127.0.0.1:5173/`. Konto można utworzyć przyciskiem „Logowanie”.

Konto testowego kierowcy przypisanego do obu przewoźników:

- e-mail: `kierowca@vztm-kielce.pl`
- hasło: `Kierowca123!`

Administrator może w panelu przełączać VMPK/VBP, otworzyć zakładkę „Grafik” albo „Tabor”, edytować pozycje i użyć przycisku „Zapisz zmiany”.

Wersja lokalna przechowuje konta i zgłoszenia w pamięci procesu API. Przed publikacją należy podłączyć trwałą bazę danych, na przykład Supabase.

Budowanie wersji produkcyjnej:

```powershell
npm.cmd run build
```
