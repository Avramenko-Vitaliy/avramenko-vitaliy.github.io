const Search = React.createClass({

    handleChangeSearch(e) {
        this.props.onSearch(e.target.value.toLowerCase());
    },

    render() {
        return (
            <form role="form" className="form-horizontal">
                <div className="form-group">
                    <div className="col-md-12">
                        <div className="input-group">
                            <input type="text"
                                   className="form-control"
                                   placeholder="Search..."
                                   onChange={this.handleChangeSearch}
                            />
                            <span className="input-group-btn">
                                <button className="btn btn-secondary" type="button">Go!</button>
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
});

const Editor = React.createClass({

    render() {
        return (
            <form role="form" className="form-horizontal">
                <div className="form-group">
                    <div className="col-md-12">
                        <input type="text"
                               id="title"
                               className="form-control"
                               placeholder="Title"
                               value={this.props.title || ''}
                               onChange={this.props.handleChangeTitle}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="col-md-12">
                        <textarea id="text"
                                  className="form-control"
                                  placeholder="Input text that you want to publish"
                                  value={this.props.text || ''}
                                  onChange={this.props.handleChangeText}
                        />
                    </div>
                </div>
            </form>
        );
    }
});

const PATTERN_PARSE_HASHTAGS = /(^|\s)(#[A-Za-z\d-]+)/ig;

const MorkupText = React.createClass({
    
    remarkable: new Remarkable('full', {
        typographer: true,
        html: true,
        breaks: true
    }),
    
    renderText(text) {
        return this.remarkable.render(text).replace(PATTERN_PARSE_HASHTAGS, "$1<a>$2</a>");
    },
    
    render() {
        return (
            <blockquote dangerouslySetInnerHTML={{__html: this.renderText(this.props.text)}}
                        onClick={this.props.onClick}
            />
        );
    }
});

const Article = React.createClass({

    getInitialState() {
        return {
            isMinimized: !this.props.isPreview
        };
    },

    handleDelete() {
        const {
            article,
            onDelete
        } = this.props;
        
        return onDelete && onDelete(article.id);
    },

    handleExpandOrCollapse() {
        this.setState({isMinimized: !this.state.isMinimized});
    },

    handleClick() {
        const {
            article,
            onEdit
        } = this.props;
        
        return onEdit && onEdit(article.id);
    },

    render() {
        const {article} = this.props;

        return (
            <div className="card-article">
                <div className="alert-dismissible">
                    <h4 style={{marginLeft: 20}}>
                        <i className={`fa fa-fw fa-sort-${this.state.isMinimized ? 'desc' : 'asc'}`}
                              style={{cursor: 'pointer'}}
                              onClick={this.handleExpandOrCollapse}
                        />
                        <strong>{article.title}</strong>
                        <a className="close" onClick={this.handleDelete}>&times;</a>
                    </h4>
                    {
                        !this.state.isMinimized && <MorkupText onClick={this.handleClick} text={article.text} />
                    }
                </div>
            </div>
        );
    }
});

const FeedArticles = React.createClass({

    getInitialState() {
        return {
            editIdArticle: null
        };
    },

    shouldComponentUpdate(nextProps, nexState) {
        return (this.props.articles !== nextProps.articles) || (this.state.editIdArticle !== nexState.editIdArticle);
    },

    handleEdit(id) {
        this.setState({editIdArticle: id});
    },

    handleCancel() {
        this.setState({editIdArticle: null});
    },

    sortArticles() {
        return this.props.articles.sort((article1, article2) => article2.id - article1.id);
    },

    renderArticles() {
        return this.sortArticles().map((article) =>
                this.state.editIdArticle === article.id
                    ? <EditorArticles key={article.id}
                                        article={article}
                                        onCancel={this.handleCancel}
                                        onEditArticle={this.props.onEditArticle}
                      />
                    : <Article key={article.id}
                               article={article}
                               onDelete={this.props.onDelete}
                               onEdit={this.handleEdit}
                      />
        );
    },

    render() {
        const articles = this.renderArticles();
        return (
            <div>
                {articles}
            </div>
        );
    }
});

const DEFAULT_STATE = {
    id: null,
    title: '',
    text: '',
    isPreview: false
};

const EditorArticles = React.createClass({

    getInitialState() {
        if (this.props.article) {
            const {id, title, text} = this.props.article;
            return {id, title, text};
        } else {
            return DEFAULT_STATE;
        }
    },
    
    handleClickPublishArticle() {
        const {id, title, text} = this.state;
        const methodForSave = this.props.onEditArticle || this.props.onAddArticle;
        
        methodForSave({id, title, text, tags: this.parseHashTags(text)});
        this.handleCancel();
    },

    parseHashTags(text) {
        const result = text.match(PATTERN_PARSE_HASHTAGS);
        return result ? result.map((tag) => tag.trim()) : [];
    },

    handleCancel() {
        this.setState(DEFAULT_STATE);
        this.props.onCancel && this.props.onCancel();
    },

    handleChangeText(e) {
        this.setState({text: e.target.value});
    },

    handleChangeTitle(e) {
        this.setState({title: e.target.value});
    },

    handleChangeTab(tab) {
        this.setState({isPreview: tab === 'preview'});
    },

    render() {
        const {
            title,
            text,
            isPreview
        } = this.state;

        return (
            <div className="card-article">
                <ul className="nav nav-tabs">
                    <li className={!isPreview && 'active'} onClick={this.handleChangeTab.bind(null, 'write')}><a>Write</a></li>
                    <li className={isPreview && 'active'} onClick={this.handleChangeTab.bind(null, 'preview')}><a>Preview</a></li>
                </ul>

                <div className="tab-content">
                    {
                        isPreview
                            ? <Article article={{text, title}} isPreview={true} />
                            : <Editor text={text}
                                      title={title}
                                      handleChangeText={this.handleChangeText}
                                      handleChangeTitle={this.handleChangeTitle}
                              />
                    }
                </div>
                <div className="row">
                    <div className="col-md-3 col-md-offset-7">
                        <button type="button" className="btn btn-success btn-xs btn-block" onClick={this.handleClickPublishArticle}>Publish</button>
                    </div>
                    <div className="col-md-2">
                        <button type="button" className="btn btn-info btn-xs btn-block" onClick={this.handleCancel}>Cancel</button>
                    </div>
                </div>
                <br />
            </div>
        );
    }
});

const LIMIT_TOP_TAGS = 10;

const TopTags = React.createClass({

    shouldComponentUpdate(nextProps) {
        return this.props.tags !== nextProps.tags;
    },
    
    handlerClickByTag(tag) {
        this.props.onSearchByTag(tag);
    },
    
    compareTags(tag1, tag2) {
        return tag2[1] - tag1[1];
    },
    
    findTopTags() {
        return Object.keys(this.props.tags)
            .reduce((result, current) => {
                result.push([current, this.props.tags[current]]);
                return result;
            }, [])
            .sort(this.compareTags)
            .slice(0, LIMIT_TOP_TAGS);
    },

    renderTags() {
        return this.findTopTags().map((tag) =>
            <p key={tag[0]}><a onClick={this.handlerClickByTag.bind(null, tag[0])}>{tag[0]}</a> ({tag[1]})</p>
        );
    },

    render() {
        return (
            <form role="form" className="form-horizontal">
                <div className="well" style={{height: 500}}>
                    <p><a onClick={this.handlerClickByTag.bind(null, 'all')}>All</a></p>
                    {this.renderTags()}
                </div>
            </form>
        );
    }
});

const App = React.createClass({

    getInitialState() {
        return {
            articles: [],
            searchValue: '',
            filterByTag: ''
        };
    },

    handleDelete(id) {
        this.setState({articles: this.state.articles.filter((article) => article.id !== id)});
    },

    handleAddNewArticle(article) {
        article.id = Date.now();
        this.setState({articles: [article, ...this.state.articles]});
    },
    
    handleEditArticle(editedArticle) {
        const articles = this.state.articles.filter((article) => editedArticle.id !== article.id);
        this.setState({articles: [editedArticle, ...articles]});
    },

    handleSearch(value) {
        this.setState({searchValue: value});
    },

    handleSearchByTag(tag) {
        this.setState({filterByTag: tag !== 'all' ? tag : ''});
    },

    getArticles() {
        const {
            searchValue,
            filterByTag
        } = this.state;
        
        return this.state.articles.filter((article) =>
                                   article.title.toLowerCase().indexOf(searchValue) !== -1 &&
                                   (filterByTag ? article.tags.indexOf(this.state.filterByTag) !== -1 : true));
    },

    getTags() {
        return this.state.articles
            .reduce((result, article) => result.concat(article.tags), [])
            .reduce((result, tag) => {
                result[tag] = (result[tag] || 0) + 1;
                return result
            }, {});
    },

    render() {
        const articles = this.getArticles();
        const tags = this.getTags();

        return (
            <div className="container-fluid">
                <br />
                <div className="row">
                    <div className="col-md-2">
                        <TopTags tags={tags}
                                  onSearchByTag={this.handleSearchByTag}
                        />
                    </div>
                    <div className="col-md-10">
                        <div className="row">
                            <div className="col-md-11">
                                <Search onSearch={this.handleSearch} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-11">
                                <EditorArticles onAddArticle={this.handleAddNewArticle} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-11">
                                <FeedArticles articles={articles}
                                              onDelete={this.handleDelete}
                                              onEditArticle={this.handleEditArticle}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
