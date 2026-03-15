import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

function App() {
  const [pages, setPages] = useState(1)
  const [keywordInput, setKeywordInput] = useState('')
  const [writerInput, setWriterInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [excludeKeywords, setExcludeKeywords] = useState(() => {
    const saved = localStorage.getItem('excludeKeywords')
    return saved ? JSON.parse(saved) : []
  })
  const [excludeWriters, setExcludeWriters] = useState(() => {
    const saved = localStorage.getItem('excludeWriters')
    return saved ? JSON.parse(saved) : []
  })
  const [excludeLocations, setExcludeLocations] = useState(() => {
    const saved = localStorage.getItem('excludeLocations')
    return saved ? JSON.parse(saved) : []
  })
  const [excludeCategories, setExcludeCategories] = useState(() => {
    const saved = localStorage.getItem('excludeCategories')
    return saved ? JSON.parse(saved) : []
  })
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Save exclude lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('excludeKeywords', JSON.stringify(excludeKeywords))
  }, [excludeKeywords])

  useEffect(() => {
    localStorage.setItem('excludeWriters', JSON.stringify(excludeWriters))
  }, [excludeWriters])

  useEffect(() => {
    localStorage.setItem('excludeLocations', JSON.stringify(excludeLocations))
  }, [excludeLocations])

  useEffect(() => {
    localStorage.setItem('excludeCategories', JSON.stringify(excludeCategories))
  }, [excludeCategories])

  // Filter listings by excluding matched writers and locations
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Client-side keyword exclusion (matches server-side logic)
      const keywordExcluded = excludeKeywords.some(keyword => {
        const k = keyword.trim().toLowerCase()
        if (!k) return false
        return item.title.toLowerCase().includes(k) ||
               item.writer.toLowerCase().includes(k) ||
               item.category.toLowerCase().includes(k)
      })
      const writerExcluded = excludeWriters.some(w =>
        item.writer.toLowerCase().includes(w.toLowerCase())
      )
      const locationExcluded = excludeLocations.some(l =>
        item.location.toLowerCase().includes(l.toLowerCase())
      )
      const categoryExcluded = excludeCategories.some(c =>
        item.category.toLowerCase().includes(c.toLowerCase())
      )
      return !keywordExcluded && !writerExcluded && !locationExcluded && !categoryExcluded
    })
  }, [listings, excludeKeywords, excludeWriters, excludeLocations, excludeCategories])

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = keywordInput.trim()
      if (trimmed && !excludeKeywords.includes(trimmed)) {
        setExcludeKeywords([...excludeKeywords, trimmed])
        setKeywordInput('')
      }
    }
  }

  const handleAddWriter = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = writerInput.trim()
      if (trimmed && !excludeWriters.includes(trimmed)) {
        setExcludeWriters([...excludeWriters, trimmed])
        setWriterInput('')
      }
    }
  }

  const handleAddLocation = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = locationInput.trim()
      if (trimmed && !excludeLocations.includes(trimmed)) {
        setExcludeLocations([...excludeLocations, trimmed])
        setLocationInput('')
      }
    }
  }

  const handleAddCategory = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = categoryInput.trim()
      if (trimmed && !excludeCategories.includes(trimmed)) {
        setExcludeCategories([...excludeCategories, trimmed])
        setCategoryInput('')
      }
    }
  }

  const removeKeyword = (keyword) => {
    setExcludeKeywords(excludeKeywords.filter(k => k !== keyword))
  }

  const removeWriter = (writer) => {
    setExcludeWriters(excludeWriters.filter(w => w !== writer))
  }

  const removeLocation = (location) => {
    setExcludeLocations(excludeLocations.filter(l => l !== location))
  }

  const removeCategory = (category) => {
    setExcludeCategories(excludeCategories.filter(c => c !== category))
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
        {/* Exclude Keywords Section */}
        <div className="filter-section">
          <h2>Exclude Keywords</h2>
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

        {/* Exclude Writers Section */}
        <div className="filter-section">
          <h2>Exclude Writers</h2>
          <div className="keyword-input-group">
            <input
              type="text"
              placeholder="Add writer..."
              value={writerInput}
              onChange={(e) => setWriterInput(e.target.value)}
              onKeyDown={handleAddWriter}
            />
            <button onClick={handleAddWriter} className="btn-add">Add</button>
          </div>
          <div className="keyword-list">
            {excludeWriters.map((w, i) => (
              <div key={i} className="keyword-tag writer-tag">
                <span>{w}</span>
                <button onClick={() => removeWriter(w)} className="btn-remove">×</button>
              </div>
            ))}
            {excludeWriters.length === 0 && (
              <p className="empty-keywords">No writers excluded</p>
            )}
          </div>
        </div>

        {/* Exclude Locations Section */}
        <div className="filter-section">
          <h2>Exclude Locations</h2>
          <div className="keyword-input-group">
            <input
              type="text"
              placeholder="Add location..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleAddLocation}
            />
            <button onClick={handleAddLocation} className="btn-add">Add</button>
          </div>
          <div className="keyword-list">
            {excludeLocations.map((l, i) => (
              <div key={i} className="keyword-tag location-tag-sidebar">
                <span>{l}</span>
                <button onClick={() => removeLocation(l)} className="btn-remove">×</button>
              </div>
            ))}
            {excludeLocations.length === 0 && (
              <p className="empty-keywords">No locations excluded</p>
            )}
          </div>
        </div>

        {/* Exclude Categories Section */}
        <div className="filter-section">
          <h2>Exclude Categories</h2>
          <div className="keyword-input-group">
            <input
              type="text"
              placeholder="Add category..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={handleAddCategory}
            />
            <button onClick={handleAddCategory} className="btn-add">Add</button>
          </div>
          <div className="keyword-list">
            {excludeCategories.map((c, i) => (
              <div key={i} className="keyword-tag category-tag-sidebar">
                <span>{c}</span>
                <button onClick={() => removeCategory(c)} className="btn-remove">×</button>
              </div>
            ))}
            {excludeCategories.length === 0 && (
              <p className="empty-keywords">No categories excluded</p>
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
            <span>Total Results: {filteredListings.length}{listings.length !== filteredListings.length ? ` of ${listings.length}` : ''}</span>
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
                {filteredListings.length > 0 ? (
                  filteredListings.map((item, idx) => (
                    <tr key={item.index}>
                      <td className="col-index">{idx + 1}</td>
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
                      {isLoading ? 'Fetching data...' : listings.length > 0 ? 'No listings match the current filters.' : 'No listings found. Start by clicking Scrape.'}
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
