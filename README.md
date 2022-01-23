# Cryoverse

Cryoverse allows researchers to share their cryostat optimisations and serves as a knowledge base for young researchers seeking help with their experiments.

**App**: https://cryoverse.web.app\
**Repository**: https://github.com/stoianmihail/Cryoverse

Implemented as an web app on Firebase, Cryoverse uses HTML5, Javascript, CSS, and the Bootstrap framework. We’ve enabled the authentification, database, hosting, and storage functionalities of Firebase.

Let us go through each page and discuss its particularities:
    
### Main page (`index.html`)

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/main.png?raw=true)

The navbar contains tabs to the other pages + profile image of the current user.
Apart from this functionality, it also contains a search bar (not functional).

The tab below the navbar has filters (bootstrap navs), which enhance the search by topics (Vibrations, Magnets, Temperature range, Sample holder).

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/nav.png?raw=true)

Then, top articles are displayed, sorted by their timestamp.
Each post displays the title + content + attachments, as well as the last modification timestamp. Moreover, it has several tags, used in the main search function.
The profile of each user can be accessed by clicking on its photo.

The entrance to the actual forum can be made by clicking any topic, redirecting the user to `forum.html?tag=<tag>`. As the filters disappear when the user scrolls down, we place the filters as images in the navbar, as shown in the following image:

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/top.png?raw=true)

### Forum (`forum.html`)
    
As one filter has been clicked, the posts are sorted by the respective tag and sorted by timestamp. Each post has the same characteristics as the posts on the main page. However, we shrink the length of each post to occupy a single line.

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/forum.png?raw=true)

Moreover, the user has the possibility to reply to a post or star it. This functionality is accessible through the thread, which is displayed when the user clicks on the corresponding post.
![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/star.png?raw=true)
![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/reply.png?raw=true)
    
### New Discussion (`post.html`)

The user can start a new discussion, by clicking on the button `+ New Discussion`, which redirects him to `post.html`.

In the post, the user has the possibility to:
- insert tags, which would make the search for other uses faster.
    - implemented as simple-tags.
- attach relevant images/documents for his/her post (not functional).
- enable which group its post is dedicated for
    - The team functionality enables one to only share post within its group, e.g., WSI Finley group

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/post.png?raw=true)

### Profile (`user.html`)

When clicking on its own profile or on other users’ profiles, the user is redirected to `user.html`, having the uid of the respective user.

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/user-uid.png?raw=true)

The page displays on the left side the username, a short description of the user, its academic title, as well as the institutions where he/she works at. Default links to other social media accounts are displayed.

As a main feature of Cryoverse, the user is able to create/participate teams within the institutions he/she works at. There is also an inbox feature, where the logged user can send private messages.

![](https://github.com/stoianmihail/Cryoverse/blob/main/screenshots/inbox.png?raw=true)

On the right side, there is an overview of all posts the respective user has posted.
The total amount of posts and stars collected contribute to the reputation of the respective user.



                    




