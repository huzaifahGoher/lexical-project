import { combineReducers } from 'redux'
import { themeReducer } from './features/theme/themeSlice'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  themeObject: themeReducer
})

export default rootReducer