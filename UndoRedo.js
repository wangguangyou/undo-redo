const { enablePatches } = require('immer')
enablePatches()
const { applyPatches, produce } = require('immer')

class UndoRedo {

  constructor(state, silence) {
    this._silence = silence
    this._changes = {}
    this._currentVersion = 0
    this._initialState = state
    this._currentState = state
  }

  getInitialState(){
    return this._initialState
  }

  produce(cb) {
    this._currentState = produce(
      this._currentState,
      cb,
      (patches, inverseChanges) => {
        this._currentVersion++

        this._changes[this._currentVersion] = {
          redo: patches,
          undo: inverseChanges,
        }

        let c = this._currentVersion + 1
        while (this._changes[c]) {
          delete this._changes[c]
          c++
        }
      }
    )
  }

  _emitError(error) {
    if (!this.silence) {
      throw new Error(error)
    }
  }

  changeByIndex(index) {
    if (index > this._currentVersion) {
      return this._redoByIndex(index)
    }
    if (index < this._currentVersion) {
      return this._undoByIndex(index)
    }
    return this._currentState
  }

  undo(count = 1) {
    return this._undoByIndex(this._currentVersion - count)
  }

  _undoByIndex(index = this._currentVersion - 1) {
    let target = this._changes[index]
    if (index == 0) {
      this._currentVersion = index
      return (this._currentState = this._initialState)
    }
    if (target) {
      let list = []
      for (let i = index + 1; i <= this._currentVersion; i++) {
        list.push(this._changes[i])
      }
      let patches = list
        .reduce((a, c) => {
          return a.concat(c.undo)
        }, [])
        .reverse()
      this._currentState = applyPatches(this._currentState, patches)
      this._currentVersion = index
    } else {
      this._emitError(
        `Cannot be undo to position ${index} as it is before the initial position 0`
      )
    }
    return this._currentState
  }

  redo(count = 1) {
    return this._redoByIndex(this._currentVersion + count)
  }

  _redoByIndex(index = this._currentVersion + 1) {
    let target = this._changes[index]

    if (target) {
      let list = []
      for (let i = this._currentVersion; i <= index; i++) {
        if (!this._changes[i]) break
        list.push(this._changes[i])
      }
      let patches = list.reduce((a, c) => {
        return a.concat(c.redo)
      }, [])
      this._currentState = applyPatches(this._currentState, patches)
      this._currentVersion = index
    } else {
      this._emitError(
        `Cannot be redo to position ${index} as it is after the last position ${
          Object.keys(this._changes).length
        }`
      )
    }

    return this._currentState
  }
}
module.exports = UndoRedo
 