# undo-redo

```js
let textState = { a: { x: [0] } }
let undoRedo = new UndoRedo(textState)
undoRedo.produce((draft) => {
  draft.a.x[0] = 1
  draft.b = { x: 1, y: 1, z: [111] }
})
undoRedo.produce((draft) => {
  draft.a.x = [2, 2]
  draft.b.z = { cc: 123 }
  draft.c = 2
})

undoRedo.produce((draft) => {
  draft.a = 3
  draft.b = 3
  draft.c = 3
  draft.d = 3
})


console.log(undoRedo.undo()) 
//{ a: { x: [ 2, 2 ] }, b: { x: 1, y: 1, z: { cc: 123 } }, c: 2 } 

undoRedo.produce((draft) => {
  draft.a.x = [1, 2, 3, 4]
  draft.b = 5
})
console.log(undoRedo.undo()) 
//{ a: { x: [ 2, 2 ] }, b: { x: 1, y: 1, z: { cc: 123 } }, c: 2 }

console.log(undoRedo.redo()) 
//{ a: { x: [ 1, 2, 3, 4 ] }, b: 5, c: 2 }

console.log(undoRedo.changeByIndex(1)) 
//{ a: { x: [ 1 ] }, b: { x: 1, y: 1, z: [ 111 ] } }

console.log(undoRedo.changeByIndex(3)) 
//{ a: { x: [ 1, 2, 3, 4 ] }, b: 5, c: 2 }
```

## 参数

1. 监听的原始对象
2. 操作越界是否静默失败，可选默认false

| 实例方法        | 描述                 |                      参数                       |
| :-------------- | -------------------- | :---------------------------------------------: |
| undo            | 撤销更改             |        `count` 撤销操作次数，默认为一次         |
| redo            | 重写(还原)上次撤销   |        `count` 重写操作次数，默认为一次         |
| changeByIndex   | 将值定位为某一次更改 | `index `从0开始，0为初始值，每次修改index都会+1 |
| getInitialState | 获取初始值           |                        -                        |

