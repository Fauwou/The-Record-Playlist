# Group Repository for COMP SCI 2207/7207 Web & Database Computing Web Application Project (2023 Semester 1)


# DESCRIPTION
The Record Playlist is a Spotify-adjacent tool and website used to easily navigate your music interests and access your favourite tracks, artists, albums and personal playlists. It gives you the opportunity to simply play your music, and keep track of your personal history of listening!

# Instructions & Setup
1. Source and open the GitHub Repository via VSC (or any respective codespace) and into a Dev Container.
2. Go to "developer.spotify.com", and log in with the Spotify account you intend to sign in into our app with.
3. Go to dashboard, create an app. App name, put anything, App Description, put anything. Redirect URIs: "http://127.0.0.1:8080/profile.html" and "http://127.0.0.1:8080/callback". Tick Web API. Save the app.
4. Using the information provided (Client ID and Client Secret), change the Client ID (both in .env and script.js) and Secret ID (in the .env).
5. Ensure the relevant packages are downloaded should any error arise ("npm install 'name of package'"):
    - xss-clean
    - mysql
    - node.js
6. Open the terminal, entering "service mysql start", "mysql < Database.sql", followed by "mysql" leaving it to run, and then "npm start" in another bash terminal. Ensure the current port is forwarding to "8080".
7. After waiting 10~ seconds, open the suggested notification (or navigate to Ports and click open to browser) to enter the website. Feel free to navigate the site.




# List of Features & Functionality
- Basic webpage layout with separate pages for separate information
- Interactive U.I containing dropdowns, filter buttons, modal boxes, collapsible sections
- Redirect to Spotify sign in page to log in with Spotify account and displays account information
- Fetch requests of data (Liked, artists, playlists, albums, albumTracks, PlaylistTracks, ArtistTopTracks, getUsers) which is displayed in library.html
- Embed music player via iFrame is capable of playing albums, tracks, artist's tracks and playlists
- Has default, light and dark mode features
- Location of current pages are displayed through the three accessible buttons in the navigation bar
- Information in library.html can be shown and hidden using the buttons via a filter
- Sign in logs the user's information into the "User" table in appDatabases (Database.sql)



# Known Bugs or Limitations
- Spotify Login Loop/ Authentication Failure
    - Occasionally during a request for authentication after attempting to log in, Spotify often seems to fail in giving a response for data, often leaving the profile page blank and without any Spotify data.
    Go to "home", click log in again and redo the process until it allows for your request to go through. Normally only takes 2 attempts.

- Failure in Data Persistance
    - Upon referesh of any selected web page that utilises the fetch requests, aka, "music.html" or "profile.html", the existing data is erased and must be reperformed in order to setup again.

- Security, Certificates and HTTPS Issues
    - While the certificates have been generated, existing headers that are attempted to be implemented into the website do not work correctly and cause the rest of the Javascript present on the website to malfunction (stopping navigation altogether). Attempting to move the website to HTTPS would not work or display.

- Spotify API Access Limit
    - An original goal of this project extended to utilising Spotify's API as a library, being able to register new personal accounts on this website, then add, customise and make changes to your music playlists or likes as it could be similarly done on Spotify. But, due to it strictly requiring the access data of a pre-existing account, this quickly limited the ability to perform this without having pre-set data.

- Spotify API Request Limit
    - As Spotify limits their IDs for multiple different categories, ranging from 10 to 50 per request, it made it difficult to implement our original goals in a certain way. We originally wanted to have a search bar that would allow for searching any music, artist, or album throughout Spotify's database. This quickly was shown to not be possible given the conditions, which would lead to a timeout or possible ban if we overloaded Spotify's API with requests.


Your group's shared repository for the WDC 2023 Web App Project.

Auto commit/push/sync to Github is disabled by default in this repository.
- Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)
Auto commit/push/sync to Github is disabled by default in this repository.
- Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

See [HERE](https://myuni.adelaide.edu.au/courses/85266/pages/2023-web-application-group-project-specification) for the project specification.

We recommend using the 'Shared Repository Model (Branch & Pull)' to collaborate on your work in this single repostory.
- You can read more about collaborating on GitHub repositories [HERE](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- When working on the same file at the same time, the 'Live Share' feature in VSCode can also help.
