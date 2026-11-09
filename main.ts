
ssd1309.init();

ssd1309.clear();

// Ramka wokół ekranu
ssd1309.rectangle(0, 0, 128, 64, false);

// Dwie ukośne linie
ssd1309.line(0, 0, 127, 63);
ssd1309.line(0, 63, 127, 0);

// Okrąg
ssd1309.circle(64, 32, 20, false);

// Tekst w różnych rozmiarach
ssd1309.text("HELLO", 10, 10, 2);
ssd1309.text("OLED", 85, 45, 1);

// Pojedynczy piksel
ssd1309.pixel(100, 15, true);

// Wyświetlenie całego gotowego obrazu
ssd1309.show();

// Potwierdzenie na micro:bicie
basic.showIcon(IconNames.Yes);
