
/**
 * SSD1309 OLED 128x64 I2C
 * BBC micro:bit MakeCode extension
 */

//% color="#245A89" icon="\uf108" block="SSD1309 OLED"
namespace ssd1309 {

    const ADDR = 0x3C;
    let screen = pins.createBuffer(1024);
    let ready = false;

    function command(c: number): void {
        let b = pins.createBuffer(2);
        b[0] = 0;
        b[1] = c & 255;
        pins.i2cWriteBuffer(ADDR, b, false);
    }

    function position(page: number, x: number): void {
        command(0xB0 | page);
        command(x & 15);
        command(0x10 | (x >> 4));
    }

    /**
     * Initialize SSD1309 OLED.
     */
    //% block="inicjalizuj OLED"
    //% weight=100
    export function init(): void {
        basic.pause(100);

        let seq = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F,
            0xD3, 0x00, 0x40, 0xAD, 0x8B,
            0x20, 0x02, 0xA1, 0xC8,
            0xDA, 0x12, 0x81, 0xCF,
            0xD9, 0xF1, 0xDB, 0x40,
            0xA4, 0xA6, 0xAF
        ];

        for (let c of seq) {
            command(c);
        }

        ready = true;
        clear();
        show();
    }

    /**
     * Clear RAM framebuffer.
     */
    //% block="wyczyść bufor"
    //% weight=95
    export function clear(): void {
        screen.fill(0);
    }

    /**
     * Fill framebuffer with white pixels.
     */
    //% block="wypełnij bufor"
    //% weight=94
    export function fill(): void {
        screen.fill(255);
    }

    /**
     * Send complete framebuffer to OLED.
     */
    //% block="wyświetl gotowy obraz"
    //% weight=90
    export function show(): void {
        if (!ready) return;

        let packet = pins.createBuffer(17);
        packet[0] = 0x40;

        for (let page = 0; page < 8; page++) {
            position(page, 0);

            for (let x = 0; x < 128; x += 16) {
                for (let i = 0; i < 16; i++) {
                    packet[i + 1] =
                        screen[page * 128 + x + i];
                }

                pins.i2cWriteBuffer(
                    ADDR, packet, false
                );
            }
        }
    }

    /**
     * Draw or erase one pixel in RAM.
     */
    //% block="piksel x %x y %y zapal %on"
    //% x.min=0 x.max=127
    //% y.min=0 y.max=63
    //% on.shadow="toggleOnOff"
    //% weight=85
    export function pixel(
        x: number,
        y: number,
        on: boolean = true
    ): void {
        x = Math.round(x);
        y = Math.round(y);

        if (x < 0 || x >= 128 ||
            y < 0 || y >= 64) {
            return;
        }

        let index =
            Math.idiv(y, 8) * 128 + x;

        let mask = 1 << (y % 8);

        if (on) {
            screen[index] |= mask;
        } else {
            screen[index] &= (255 ^ mask);
        }
    }

    /**
     * Draw a line using Bresenham algorithm.
     */
    //% block="linia x1 %x1 y1 %y1 x2 %x2 y2 %y2"
    //% weight=80
    export function line(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): void {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = x1 < x2 ? 1 : -1;
        let sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            pixel(x1, y1, true);

            if (x1 == x2 && y1 == y2)
                break;

            let e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }

            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    /**
     * Horizontal line.
     */
    //% block="linia pozioma x %x y %y długość %length"
    //% weight=79
    export function horizontal(
        x: number,
        y: number,
        length: number
    ): void {
        if (length > 0) {
            line(x, y, x + length - 1, y);
        }
    }

    /**
     * Vertical line.
     */
    //% block="linia pionowa x %x y %y długość %length"
    //% weight=78
    export function vertical(
        x: number,
        y: number,
        length: number
    ): void {
        if (length > 0) {
            line(x, y, x, y + length - 1);
        }
    }

    /**
     * Rectangle with optional fill.
     */
    //% block="prostokąt x %x y %y szerokość %w wysokość %h wypełnij %filled"
    //% weight=75
    export function rectangle(
        x: number,
        y: number,
        w: number,
        h: number,
        filled: boolean = false
    ): void {
        if (w <= 0 || h <= 0) return;

        if (filled) {
            for (let yy = y; yy < y + h; yy++) {
                horizontal(x, yy, w);
            }
        } else {
            horizontal(x, y, w);
            horizontal(x, y + h - 1, w);
            vertical(x, y, h);
            vertical(x + w - 1, y, h);
        }
    }

    /**
     * Square with optional fill.
     */
    //% block="kwadrat x %x y %y bok %side wypełnij %filled"
    //% weight=74
    export function square(
        x: number,
        y: number,
        side: number,
        filled: boolean = false
    ): void {
        rectangle(x, y, side, side, filled);
    }

    /**
     * Circle with optional fill.
     */
    //% block="okrąg środek x %cx y %cy promień %radius wypełnij %filled"
    //% weight=70
    export function circle(
        cx: number,
        cy: number,
        radius: number,
        filled: boolean = false
    ): void {
        radius = Math.round(radius);
        if (radius < 0) return;

        let x = radius;
        let y = 0;
        let err = 1 - radius;

        while (x >= y) {
            if (filled) {
                line(cx - x, cy + y, cx + x, cy + y);
                line(cx - x, cy - y, cx + x, cy - y);
                line(cx - y, cy + x, cx + y, cy + x);
                line(cx - y, cy - x, cx + y, cy - x);
            } else {
                pixel(cx + x, cy + y, true);
                pixel(cx - x, cy + y, true);
                pixel(cx + x, cy - y, true);
                pixel(cx - x, cy - y, true);
                pixel(cx + y, cy + x, true);
                pixel(cx - y, cy + x, true);
                pixel(cx + y, cy - x, true);
                pixel(cx - y, cy - x, true);
            }

            y++;

            if (err < 0) {
                err += 2 * y + 1;
            } else {
                x--;
                err += 2 * (y - x) + 1;
            }
        }
    }

    // Font 5x7: A-Z, 0-9 and basic symbols.
    // Five bytes per character, columns left to right.

    const CHARS =
        " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:!?-+/()=%";

    const FONT = [
        "0000000000",
        "7e1111117e", "7f49494936",
        "3e41414122", "7f4141221c",
        "7f49494941", "7f09090901",
        "3e4149517a", "7f0808087f",
        "00417f4100", "204040413f",
        "7f08142241", "7f40404040",
        "7f020c027f", "7f0408107f",
        "3e4141413e", "7f09090906",
        "3e4151215e", "7f09192946",
        "2649494932", "01017f0101",
        "3f4040403f", "1f2040201f",
        "3f4038403f", "6314081463",
        "0708700807", "6151494543",
        "3e4549513e", "00427f4000",
        "4261514946", "2141494d33",
        "1814127f10", "2745454539",
        "3c4a494930", "0171090503",
        "3649494936", "064949291e",
        "0060600000", "0050600000",
        "0036360000", "0000363600",
        "0201510906", "0201590906",
        "0808080808", "081c3e1c08",
        "0008040201", "1c22414100",
        "004141221c", "142a142a14",
        "08083e0808"
    ];

    function glyph(ch: string): string {
        let index = CHARS.indexOf(ch);

        if (index < 0 || index >= FONT.length) {
            return FONT[0];
        }

        return FONT[index];
    }

    /**
     * Draw text, size 1-5.
     */
    //% block="tekst %message x %x y %y rozmiar %size"
    //% size.min=1 size.max=5 size.defl=1
    //% weight=65
    export function text(
        message: string,
        x: number,
        y: number,
        size: number = 1
    ): void {
        size = Math.constrain(
            Math.round(size), 1, 5
        );

        message = message.toUpperCase();
        let startX = x;

        for (let k = 0; k < message.length; k++) {
            let ch = message.charAt(k);

            if (ch == "\n") {
                x = startX;
                y += 8 * size;
                continue;
            }

            let pattern = glyph(ch);

            for (let col = 0; col < 5; col++) {
                let bits = parseInt(
                    pattern.substr(col * 2, 2), 16
                );

                for (let row = 0; row < 7; row++) {
                    if ((bits & (1 << row)) != 0) {
                        for (let a = 0; a < size; a++) {
                            for (let b = 0; b < size; b++) {
                                pixel(
                                    x + col * size + a,
                                    y + row * size + b,
                                    true
                                );
                            }
                        }
                    }
                }
            }

            x += 6 * size;
        }
    }

    /**
     * Draw a number.
     */
    //% block="liczba %value x %x y %y rozmiar %size"
    //% size.min=1 size.max=5 size.defl=2
    //% weight=64
    export function number(
        value: number,
        x: number,
        y: number,
        size: number = 2
    ): void {
        text("" + value, x, y, size);
    }

    /**
     * OLED brightness 0-255.
     */
    //% block="jasność OLED %value"
    //% value.min=0 value.max=255 value.defl=128
    //% weight=50
    export function brightness(value: number): void {
        command(0x81);
        command(Math.constrain(value, 0, 255));
    }

    /**
     * Enable or disable OLED.
     */
    //% block="ekran włączony %on"
    //% on.shadow="toggleOnOff"
    //% weight=49
    export function displayOn(on: boolean): void {
        command(on ? 0xAF : 0xAE);
    }

    /**
     * Invert OLED display.
     */
    //% block="negatyw %on"
    //% on.shadow="toggleOnOff"
    //% weight=48
    export function invert(on: boolean): void {
        command(on ? 0xA7 : 0xA6);
    }
}
