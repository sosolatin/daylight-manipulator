import { useEffect, useReducer } from 'react'
import { getAllImages } from '../storage/imageStore.js'

function feedReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.items.map(item => ({ ...item, type: 'image' }))

    case 'ADD_PRELOADER':
      return [{ id: action.tempId, type: 'preloader', ...action.meta }, ...state]

    case 'REPLACE_PRELOADER':
      return state.map(item =>
        item.id === action.tempId ? { ...action.record, type: 'image' } : item,
      )

    case 'REMOVE_PRELOADER':
      return state.filter(item => item.id !== action.tempId)

    case 'REMOVE_IMAGE':
      return state.filter(item => item.id !== action.id)

    case 'CLEAR':
      return []

    default:
      return state
  }
}

export function useFeed() {
  const [feed, dispatch] = useReducer(feedReducer, [])

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    getAllImages().then(items => dispatch({ type: 'HYDRATE', items }))
  }, [])

  function addPreloader(tempId, meta) {
    dispatch({ type: 'ADD_PRELOADER', tempId, meta })
  }

  function replacePreloader(tempId, record) {
    dispatch({ type: 'REPLACE_PRELOADER', tempId, record })
  }

  function removePreloader(tempId) {
    dispatch({ type: 'REMOVE_PRELOADER', tempId })
  }

  function removeFromFeed(id) {
    dispatch({ type: 'REMOVE_IMAGE', id })
  }

  function clearFeed() {
    dispatch({ type: 'CLEAR' })
  }

  return { feed, addPreloader, replacePreloader, removePreloader, removeFromFeed, clearFeed }
}
