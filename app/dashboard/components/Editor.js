import React from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter, Link } from 'react-router-dom'

// import SimpleMDE from 'simplemde'

import Toolbox from './Toolbox'


function EditorHeader(props) {
  return (
    <div className='writer-head'>
      <div className='writer-head-left'>
        <Link to="/posts" className="navigate-back">
          <i className="icon ion-ios-arrow-thin-left"></i><span>Posts</span>
        </Link>
      </div>
      <div className='writer-head-content'>
        <button type="button" className="btn btn-ghost" onClick={props.onPublishClicked}>
          <span>Publish</span>
        </button>
        <button type="button" className="btn btn-text btn-icon-only" onClick={props.onMarkdownHelpClicked}>
          <i className="icon ion-help-circled"></i>
        </button>
        <button type="button" className="btn btn-text btn-icon-only" onClick={props.onPhotoChooserClicked}>
          <i className="icon ion-image"></i>
        </button>
        <button type="button" className="btn btn-text btn-icon-only" onClick={props.onPostMetaClicked}>
          <i className="icon ion-pricetag"></i>
        </button>
      </div>
    </div>
  )
}


// class MarkdownEditor extends React.Component {

//   render() {
//     return (
//       <textarea placeholder="Content" type="text" />
//     )
//   }
// }


@inject('editorStore', 'postStore', 'uiStore')
@withRouter
@observer
class Editor extends React.Component {

  constructor(props) {
    super(props)
    this.changeTitle = this.changeTitle.bind(this)
    this.changeHeadline = this.changeHeadline.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.onMarkdownHelpClicked = this.onMarkdownHelpClicked.bind(this)
    this.onPhotoChooserClicked = this.onPhotoChooserClicked.bind(this)
    this.onPostMetaClicked = this.onPostMetaClicked.bind(this)
    this.onPublishClicked = this.onPublishClicked.bind(this)
    this.onDeleteClicked = this.onDeleteClicked.bind(this)
    this.onMaskClicked = this.onMaskClicked.bind(this)
  }

  componentWillMount() {
    this.props.editorStore.setPostID(this.props.match.params.id)
  }

  componentDidMount() {
    this.props.uiStore.hideAside()
    this.props.editorStore.load()
    document.title = this.props.match.params.id ? 'Edit Post' : 'New Post'
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.props.editorStore.setPostID(this.props.match.params.id)
      this.props.editorStore.load()
    }
  }

  changeTitle(e) {
    this.props.editorStore.setTitle(e.target.value)
  }

  changeHeadline(e) {
    this.props.editorStore.setHeadline(e.target.value)
  }

  setTextareaHeight() {
    this.refs.content.style.cssText = 'height:' + this.refs.content.scrollHeight + 'px'
  }

  changeContent(e) {
    this.setTextareaHeight()
    this.props.editorStore.setContent(e.target.value)
  }

  onMarkdownHelpClicked(e) {
    this.props.uiStore.showToolbox('help')
  }

  onPhotoChooserClicked(e) {
    this.props.uiStore.showToolbox('photo')
  }

  onPostMetaClicked(e) {
    this.props.uiStore.showToolbox('meta')
  }

  onMaskClicked(e) {
    this.props.uiStore.hideToolbox()
  }

  onDeleteClicked(e) {
    const id = this.props.editorStore.id
    if (id) {
      this.props.postStore.destory(id)
        .then(() => this.props.history.replace(`/posts/`))
    }
  }

  onPublishClicked(e) {
    e.preventDefault();
    const { editorStore } = this.props
    editorStore.submit()
      .then(post => {
        editorStore.reset()
        this.props.history.replace(`/posts/`)
      })
  }

  render() {
    const { inProgress, errors, title, slug, headline, content } = this.props.editorStore
    return (
      <div className="main">
        <EditorHeader
          onPublishClicked={this.onPublishClicked}
          onMarkdownHelpClicked={this.onMarkdownHelpClicked}
          onPhotoChooserClicked={this.onPhotoChooserClicked}
          onPostMetaClicked={this.onPostMetaClicked}
        />
        <section className="writer-main">
          <form>
            <div className="post-field title">
              <input placeholder="Title" type="text" value={title} onChange={this.changeTitle} />
            </div>
            <div className="post-field headline">
              <input placeholder="Headline" type="text" value={headline} onChange={this.changeHeadline} />
            </div>
            <div className="post-field content">
              <textarea placeholder="Content" type="text" className="markdown-area" 
                ref="content" value={content} onChange={this.changeContent} />
            </div>
          </form>
        </section>
        <Toolbox onDeleteClicked={this.onDeleteClicked} onMaskClicked={this.onMaskClicked}/>
      </div>
    )
  }

}

export default Editor