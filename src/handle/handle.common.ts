
/**
 * 获取鼠标在canvas中的相对位置
 * @param canvas 
 * @param x 
 * @param y 
 */
export function getPointOnCanvas(canvas: HTMLCanvasElement,x: number, y: number) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Number(x.toFixed()) - rect.left,
        y: Number(y.toFixed()) - rect.top
    }
}

/**
 * 深拷贝
 * @param object 
 */
export function cloneDeep(object: any){
    return JSON.parse(JSON.stringify(object))
}