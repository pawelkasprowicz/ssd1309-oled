
basic.showIcon(IconNames.Heart)

input.onButtonPressed(Button.A, function () {
    ssd1309.init()
    ssd1309.clear()

    ssd1309.rectangle(0, 0, 128, 64, false)
    ssd1309.line(0, 0, 127, 63)
    ssd1309.circle(64, 32, 20, false)
    ssd1309.text("HELLO", 10, 10, 2)

    ssd1309.show()

    basic.showIcon(IconNames.Yes)
})
