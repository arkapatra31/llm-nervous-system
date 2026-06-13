import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { tokenize, type Token } from '../lib/tokenizer'
import { applyChatTemplate } from '../lib/template'

// The user's query flows through here so every stage can show what happened to
// *that specific input*. This is the single source of truth — stages never hold
// their own copy of the query.

const DEFAULT_QUERY = 'Explain how attention works.'

interface QueryState {
  query: string
  setQuery: (q: string) => void
  /** real tokens of the raw user text */
  tokens: Token[]
  /** the text after the chat template is applied */
  formatted: string
  /** real tokens of the formatted (templated) text */
  formattedTokens: Token[]
}

const QueryContext = createContext<QueryState | null>(null)

export function QueryProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(DEFAULT_QUERY)

  const value = useMemo<QueryState>(() => {
    const formatted = applyChatTemplate(query)
    return {
      query,
      setQuery,
      tokens: tokenize(query),
      formatted,
      formattedTokens: tokenize(formatted),
    }
  }, [query])

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuery(): QueryState {
  const ctx = useContext(QueryContext)
  if (!ctx) throw new Error('useQuery must be used within a QueryProvider')
  return ctx
}
