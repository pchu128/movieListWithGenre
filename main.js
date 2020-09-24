(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')

  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []

  const viewSwitchButton = document.querySelector('.viewSwitchButton')
  let viewMode = 'cardView'
  let currentPage = '1'
  let searchResult = []
  let displayResult =[]

  const sidePanel = document.querySelector('.nav-side')
  const genres = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }

  displayGenres(genres)

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    // displayDataList(data)
    getTotalPages(data)
    getPageData(1, data)
    searchResult = data
    displayResult = data
    
  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    let input = searchInput.value.toLowerCase()
    let results = data.filter(
      movie => movie.title.toLowerCase().includes(input)
    )
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
    searchResult = results
    displayResult = results
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    if (viewMode === 'listView') {
      currentPage = event.target.dataset.page
      getPageDataListView(event.target.dataset.page)
    } else if ((viewMode === 'cardView')) {
      currentPage = event.target.dataset.page
      getPageData(event.target.dataset.page)
    }
  })

  // listen to list / grid view buttons
  viewSwitchButton.addEventListener('click', event => {
    if (event.target.matches('.listView')) {
      getTotalPages(displayResult)
      getPageDataListView(currentPage, displayResult)
      viewMode = 'listView'
    } else if (event.target.matches('.gridView')) {
      getTotalPages(displayResult)
      getPageData(currentPage, displayResult)
      viewMode = 'cardView'
    }
  })

  // listen to genres click
  sidePanel.addEventListener('click', event => {
    let child = document.querySelector(`#${event.target.id}`)
    index = Array.from(child.parentNode.children).indexOf(child) + 1
    displayResult = []
    searchResult.forEach(data => {
      if (data.genres.includes(index)) {
        displayResult.push(data)
      }
    })
    if (viewMode === 'cardView') {
      getTotalPages(displayResult)
      getPageData(1, displayResult)
    } else if (viewMode === 'listView') {
      getTotalPages(displayResult)
      getPageDataListView(1, displayResult)
    }
  })


  // display genres (side nav-bar)
  function displayGenres(genre) {
    const genreList = Object.values(genres).map(item => item)
    let navSide = document.querySelector('.nav-side')
    genreList.forEach(genre => {
      genreClass = genre.replace(/\s/g, '')
      navSide.innerHTML += `
          <a class="flex-sm-fill text-sm-center nav-link" id="${genreClass}" data-toggle="pill" href="#" aria-selected="false">${genre}</a>
      `
    })
  }

  // display main area
  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
          <div class="col-sm-3" style="height:550px;">
            <div class="card mb-2">
              <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
              <div class="card-body movie-item-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- "More" button -->
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button --> 
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        `
    })
    dataPanel.innerHTML = htmlContent
  }

  function listView(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
          <ul class="list-group" style="width: 100%">   
            <li class="list-group-item">
              <h5 class="card-title">${item.title}
                <!-- favorite button -->
                    <button class="btn btn-info btn-add-favorite" style="float:right" data-id="${item.id}">+</button>
                <!-- "More" button -->
                    <button class="btn btn-primary btn-show-movie" style="float:right" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              </h5>
            </li>
          </ul> 
        `
    })
    dataPanel.innerHTML = htmlContent
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
          <li class="page-item">
            <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
          </li>
        `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  function getPageDataListView(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    listView(pageData)
  }
})()