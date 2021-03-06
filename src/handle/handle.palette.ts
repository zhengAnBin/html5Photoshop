/**
 * 掉色板
 */

let backgroundColor: string = '#FFFFFF', 
    foregroundColor: string = '#FFFFFF'

type paletteType = 'background' | 'foreground'

export function getPalette(type?: paletteType){
    if(type === 'background') {
        return backgroundColor
    } else if(type === 'foreground') {
        return foregroundColor
    } else {
        return [
            backgroundColor,
            foregroundColor
        ]
    }
}

export function setPalette(type: paletteType, colorValue: string) {
    if(type === 'background') {
        backgroundColor = colorValue
    } else if(type === 'foreground') {
        foregroundColor = colorValue
    } else {
        console.error(``)
    }
}