export default {
    mounted(el) {
        const dialogHeaderEl = el.querySelector('.el-dialog__header')
        const dragDom = el.querySelector('.el-dialog')
        dialogHeaderEl.style.cursor = 'move'

        const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)

        dialogHeaderEl.onmousedown = (e) => {
            const disX = e.clientX - dialogHeaderEl.offsetLeft
            const disY = e.clientY - dialogHeaderEl.offsetTop

            const screenWidth = document.body.clientWidth
            const screenHeight = document.documentElement.clientHeight
            const dragDomWidth = dragDom.offsetWidth
            const dragDomHeight = dragDom.offsetHeight
            const minDragDomLeft = dragDom.offsetLeft
            const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
            const minDragDomTop = dragDom.offsetTop
            const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight

            let styL, styT
            if (sty.left.includes('%')) {
                styL = document.body.clientWidth * parseFloat(sty.left) / 100
                styT = document.body.clientHeight * parseFloat(sty.top) / 100
            } else {
                styL = parseFloat(sty.left)
                styT = parseFloat(sty.top)
            }

            document.onmousemove = function (e) {
                let l = e.clientX - disX
                let t = e.clientY - disY

                if (-l > minDragDomLeft) {
                    l = -minDragDomLeft
                } else if (l > maxDragDomLeft) {
                    l = maxDragDomLeft
                }
                if (-t > minDragDomTop) {
                    t = -minDragDomTop
                } else if (t > maxDragDomTop) {
                    t = maxDragDomTop
                }

                dragDom.style.left = `${l + styL}px`
                dragDom.style.top = `${t + styT}px`
            }

            document.onmouseup = function () {
                document.onmousemove = null
                document.onmouseup = null
            }
        }
    }
}