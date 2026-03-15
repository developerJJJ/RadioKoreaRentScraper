import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [pages, setPages] = useState(1)
  const [keywordInput, setKeywordInput] = useState('')
  const [excludeKeywords, setExcludeKeywords] = useState(() => {
    const saved = localStorage.getItem('excludeKeywords')
    return saved ? JSON.parse(saved) : []
  })
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Save keywords to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('excludeKeywords', JSON.stringify(excludeKeywords))
  }, [excludeKeywords])

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = keywordInput.trim()
      if (trimmed && !excludeKeywords.includes(trimmed)) {
        setExcludeKeywords([...excludeKeywords, trimmed])
        setKeywordInput('')
      }
    }
  }

  const removeKeyword = (keyword) => {
    setExcludeKeywords(excludeKeywords.filter(k => k !== keyword))
  }

  const handleScrape = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://localhost:3001/api/scrape', {
        pages,
        excludeKeywords: excludeKeywords
      })
      if (response.data.success) {
        setListings(response.data.listings)
      } else {
        setError('Failed to fetch listings')
      }
    } catch (err) {
      setError('Error connecting to scraper server. Make sure it is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setListings([])
    setError(null)
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Exclude Keywords</h2>
        </div>
        <div className="sidebar-content">
          <div className="keyword-input-group">
            <input
              type="text"
              placeholder="Add keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
            />
            <button onClick={handleAddKeyword} className="btn-add">Add</button>
          </div>
          <div className="keyword-list">
            {excludeKeywords.map((k, i) => (
              <div key={i} className="keyword-tag">
                <span>{k}</span>
                <button onClick={() => removeKeyword(k)} className="btn-remove">×</button>
              </div>
            ))}
            {excludeKeywords.length === 0 && (
              <p className="empty-keywords">No keywords excluded</p>
            )}
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header>
          <h1>RadioKorea Rent Searcher</h1>
          <p className="subtitle">Premium Real Estate Scraper Tool</p>
        </header>

        <div className="search-panel">
          <div className="input-group">
            <label htmlFor="pages">Number of Pages</label>
            <input
              id="pages"
              type="number"
              min="1"
              max="10"
              value={pages}
              onChange={(e) => setPages(parseInt(e.target.value))}
            />
          </div>
          <div className="button-group">
            <button onClick={handleScrape} disabled={isLoading} className="btn-primary">
              {isLoading ? 'Scraping...' : 'Scrape Now'}
            </button>
            <button onClick={clearResults} className="btn-secondary">
              Clear Results
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results-panel">
          <div className="results-header">
            <span>Total Results: {listings.length}</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Writer</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {listings.length > 0 ? (
                  listings.map((item) => (
                    <tr key={item.index}>
                      <td className="col-index">{item.index}</td>
                      <td className="col-title">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </td>
                      <td className="col-price">{item.price}</td>
                      <td className="col-writer">{item.writer}</td>
                      <td className="col-category">
                        <span className="category-tag">{item.category}</span>
                      </td>
                      <td className="col-location">
                        <span className="location-tag">{item.location}</span>
                      </td>
                      <td className="col-date">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      {isLoading ? 'Fetching data...' : 'No listings found. Start by clicking Scrape.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
