const Search = React.createClass({

    getInitialState() {
        return {searchFilm: ""};
    },

    handlerClickSearch() {
        this.props.search(this.state.searchFilm);
    },

    handlerChangeSearch(e) {
        this.setState({searchFilm: e.target.value});
    },

    render() {
        return (
            <div className="row">
                <div className="col-md-8 col-md-offset-2">
                    <div className="input-group">
                        <input type="text" className="form-control" onChange={this.handlerChangeSearch} value={this.state.searchFilm} placeholder="Search for..."/>
                        <span className="input-group-btn">
                            <button className="btn btn-secondary" type="button" onClick={this.handlerClickSearch}>Go!</button>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
});

const Feed = React.createClass({

    getInitialState() {
        return {
            HEADER_FIELDS: [
                {name: "ID", value: "id"},
                {name: "Title", value: "title"},
                {name: "Language", value: "original_language"},
                {name: "Popularity Index", value: "popularity"},
                {name: "Votes Count", value: "vote_count"},
                {name: "Rating", value: "vote_average"},
                {name: "Release Date", value: "release_date"}
            ],
            sort: {
                columnName: null,
                direction: "asc"
            },
            films: []
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            films: nextProps.films,
            sort: {
                columnName: null,
                direction: "asc"
            }
        });
    },

    createFilmRows() {
        return this.state.films.map((film) =>
            <tr key={film.id}>
                <td>{film.id}</td>
                <td>{film.title}</td>
                <td>{film.original_language}</td>
                <td>{film.popularity}</td>
                <td>{film.vote_count}</td>
                <td>{film.vote_average}</td>
                <td>{film.release_date}</td>
            </tr>
        );
    },

    createHeader() {
        return this.state.HEADER_FIELDS.map((head) =>
            <th key={head.value}>
                <a href="#" onClick={this.doSort.bind(this, head.value)}>{head.name}</a> {this.createSortHeader(head.value)}
            </th>);
    },

    createSortHeader(field) {
        const {columnName, direction } = this.state.sort;
        return field === columnName && <i className={`fa fa-fw fa-sort-${direction}`}/>;
    },

    sorting(column, direction) {
        let sortingFunction;
        switch (column) {
            case "release_date":
                sortingFunction = (film1, film2) => new Date(film1.release_date) - new Date(film2.release_date);
                break;
            case "id":
            case "vote_count":
            case "popularity":
            case "vote_average":
                sortingFunction = (film1, film2) => film1[column] - film2[column];
                break;
            default:
                sortingFunction = (film1, film2) => film1[column].localeCompare(film2[column]);
                break;
        }
        const films = this.state.films.sort(sortingFunction);
        if (direction === "desc") {
            films.reverse();
        }
        return films;
    },

    doSort(column) {
        let { direction, columnName } = this.state.sort;
        if (column === columnName) {
            direction = direction === "asc" ? "desc" : "asc";
        } else {
            direction = "asc"
        }
        const sortedFilms = this.sorting(column, direction);
        this.setState({sort: {direction, columnName: column}, films: sortedFilms});
    },

    renderTable() {
        const headers = this.createHeader();
        const rows = this.createFilmRows();
        return (
            <table className="table table-hover">
                <thead>
                <tr>
                    {headers}
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        );
    },

    renderEmptyData() {
        return  <h5 className="text-center text-muted">Data is empty. Input what you want to find.</h5>
    },

    render() {
        const content = this.state.films.length ? this.renderTable() : this.renderEmptyData();
        return (
            <div className="row">
                <div className="col-md-10 col-md-offset-1">
                    {content}
                </div>
            </div>
        );
    }
});

const FilmTable = React.createClass({

    getInitialState() {
        return {films: []};
    },

    doSearch(value) {
        if (value) {
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=2d5baee3bdc854638c94f95989566db2&language=en-US&query=${value}`)
                .then((response) => response.json())
                .then((result) => this.setState({films: result.results}));
        } else {
            this.setState({films: []})
        }
    },

    render() {
        return (
            <div className="container">
                <Search search={this.doSearch}/>
                <Feed films={this.state.films}/>
            </div>
        );
    }
});

ReactDOM.render(
    <FilmTable />,
    document.getElementById('root')
);
