
# SSD1309 OLED for BBC micro:bit

Graphics library for SSD1309 128x64 OLED displays
using I2C and Microsoft MakeCode.

## Connection

| OLED | micro:bit |
|---|---|
| GND | GND |
| VDD | 3V |
| SCL | P19 |
| SDA | P20 |

I2C address: 0x3C

## Features

- Pixel drawing and erasing
- Lines: horizontal, vertical and diagonal
- Rectangles and squares
- Filled and outlined shapes
- Circles
- Text and numbers in sizes 1-5
- Brightness adjustment
- Display on/off
- Inverted display
- 1024-byte framebuffer
- Manual screen refresh

## Example

```typescript
ssd1309.init();

ssd1309.clear();
ssd1309.rectangle(0, 0, 128, 64, false);
ssd1309.line(0, 0, 127, 63);
ssd1309.text("HELLO", 10, 10, 2);

ssd1309.show();
```

## How it works

Drawing functions modify the RAM framebuffer.

The OLED is updated only when show() is called.

## Hardware

Tested with:
- BBC micro:bit V2
- SSD1309 128x64 I2C OLED
- I2C address 0x3C
