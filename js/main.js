$(document).ready(function() {
  const API = 'http://localhost:8000/posts';
  const modal = $('.modal');
  const closeModalBtn = $('#close_modal');
  const modalPostTitle = $('#modal_post_title');

  const postContent = $('#post_content');
  const postsList = $('#posts_list');

  const createPostBtn = $('#create_post');
  const savePostBtn = $('#save_post');

  let selectedID;
  
  function renderList(page = 1){
    fetch(`${API}?_page=${page}&_limit=10&_sort=create_timestamp&_order=desc`)
      .then(resp => resp.json())
      .then(data => {
        postsList.empty();
        data.forEach((post, index) => postsList.append(buildPostsListItem(post, index)));
      });
    };

    function buildPostsListItem(post, index){
      return `
          <li id="${post.id}" class="post box">
            <article class="media">
              <figure class="media-left">
                <p class="image is-64x64">
                  <img src="https://bulma.io/images/placeholders/128x128.png">
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>John Smith</strong> <small>@johnsmith</small> <small>${calcTimedifference(post.create_timestamp)}</small>
                    <br>
                    ${post.content}
                  </p>
                </div>
                <nav class="level is-mobile">
                  <div class="level-left">
                    <a class="level-item">
                      <span class="icon is-small"><i class="fa fa-reply"></i></span>
                    </a>
                    <a class="level-item">
                      <span class="icon is-small"><i class="fa fa-retweet"></i></span>
                    </a>
                    <a class="level-item">
                      <span class="icon is-small"><i class="fa fa-heart"></i></span>
                    </a>
                    <a class="level-item edit_post_btn">
                      <span class="icon is-small"><i class="fa fa-edit"></i></span>
                    </a>
                    
                  </div>
                </nav>
              </div>
              <div class="media-right">
                  <button class="delete delete_post_btn"></button>
              </div>
            </article>
          </li>
      `
    }

  function createPost(){
    savePostBtn.text('Tweet');
    modalPostTitle.text('New Post');
    postContent.val('');
    openModal();
  }

  function savePost(){
    const newPostObj = {
      likes: 0,
      tweets: 0,
      comments: 0,
      views: 0,
      content: postContent.val(),
      create_timestamp: Date.now()
    };
    fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(newPostObj)
    })
      .then(() => renderList());
    closeModal();
  }

  function deletePost(e){
    const id = e.target.parentNode.parentNode.parentNode.id;
    fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
      .then(() => {
        renderList();
      })
  }

  function editPost(e){
    const id = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    selectedID = id;
    fetch(`${API}/${id}`)
      .then(resp => resp.json())
      .then(post => {
        postContent.val(post.content);
        savePostBtn.text('Update');
        modalPostTitle.text('Edit Post');
        openModal();
      });
  }

  function saveEditedPost(e){
      e.preventDefault();
      console.log(postContent.val());
      const editedPost = {
          content: postContent.val(),
          create_timestamp: Date.now()
      }

      fetch(`${API}/${selectedID}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json; charset=utf-8'
          },  
          body: JSON.stringify(editedPost)
      })
          .then(() => {
            closeModal();
            renderList()
          })
  };

  function openModal(){
    modal.addClass('is-active');
  }
  function closeModal(){
    modal.removeClass('is-active');
  }
  
  createPostBtn.on('click', createPost);
  savePostBtn.on('click', submitForm);
  $('body').on('click', '.delete_post_btn', deletePost);
  $('body').on('click', '.edit_post_btn', editPost);
  
  function submitForm(e){
    if(modalPostTitle.text() === 'New Post') savePost()
    else if(modalPostTitle.text() === 'Edit Post') saveEditedPost(e)
  }
  
  closeModalBtn.on('click', closeModal);

  document.addEventListener('keyup', checkDocumentEvent);
  
  function checkDocumentEvent(e){
    if(e.code === 'Escape' && modal.hasClass('is-active')) closeModal()
  }

  //////// Helpers
  function makeElapsedTime(val, type){
    return `${Math.ceil(val)} ${type} ago`;
  }
  function calcTimedifference(time1){
    const diffSecs = ((Date.now() - time1) / 1000);
    if(diffSecs <= 60) return makeElapsedTime(diffSecs, 'secs');
    if(diffSecs > 60) return makeElapsedTime(diffSecs / 60, 'mins');
    if(diffSecs > 60 * 60) return makeElapsedTime(diffSecs / 60 / 60, 'hours');
    if(diffSecs > 60 * 60 * 24) return makeElapsedTime(diffSecs / 60 / 60 / 24, 'days');
  }

  renderList();
})

