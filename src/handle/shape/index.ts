
/**
 * 位置信息
 */
export type drawCoordinate = {
    sx: number
    sy: number
    ex: number
    ey: number
}

export type shapeAllType = 
    'rect fullLine' | 
    'rect dottedLine' |
    'ellipse fullLine' | 
    'ellipse dottedLine' | 
    'rect fillet fullLine' |
    'polygon fullLine' |
    'line fullLine'

export type lineType = 'fullLine' | 'dottedLine'

export { 
    initShape, 
    setShapeType 
} from './shape'
