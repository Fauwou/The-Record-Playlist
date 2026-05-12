-- Create database
CREATE DATABASE IF NOT EXISTS appDatabase;
USE appDatabase;

-- User table
CREATE TABLE User (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Spotify_ID VARCHAR(100),
    Display_name VARCHAR(100),
    Email VARCHAR(100),
    Profile_image TEXT
);

-- Artist table
CREATE TABLE Artist (
    Artist_ID INT AUTO_INCREMENT PRIMARY KEY,
    Artist_name VARCHAR(100) NOT NULL
);

-- Albums table
CREATE TABLE Albums (
    Album_ID INT PRIMARY KEY,
    Album_name VARCHAR(100) NOT NULL,
    Artist_ID INT,
    Album_cover TEXT,
    Release_date DATE,
    FOREIGN KEY (Artist_ID) REFERENCES Artist(Artist_ID)
);

-- Songs table
CREATE TABLE Songs (
    Song_ID INT AUTO_INCREMENT PRIMARY KEY,
    Artist_ID INT,
    Album_ID INT,
    Song_name VARCHAR(100) NOT NULL,
    Duration TIME,
    FOREIGN KEY (Artist_ID) REFERENCES Artist(Artist_ID),
    FOREIGN KEY (Album_ID) REFERENCES Albums(Album_ID)
);

-- Playlists table
CREATE TABLE Playlists (
    Playlist_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT,
    Playlist_name VARCHAR(100),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- Liked_songs table
CREATE TABLE Liked_songs (
    User_ID INT,
    Song_ID INT,
    Date_added DATETIME,
    PRIMARY KEY (User_ID, Song_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Song_ID) REFERENCES Songs(Song_ID)
);

-- Playlist_songs table
CREATE TABLE Playlist_songs (
    Playlist_ID INT,
    Position INT,
    Song_ID INT,
    Date_added DATETIME,
    PRIMARY KEY (Playlist_ID, Position),
    FOREIGN KEY (Playlist_ID) REFERENCES Playlists(Playlist_ID),
    FOREIGN KEY (Song_ID) REFERENCES Songs(Song_ID)
);

-- Followed_artists table
CREATE TABLE Followed_artists (
    User_ID INT,
    Artist_ID INT,
    PRIMARY KEY (User_ID, Artist_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Artist_ID) REFERENCES Artist(Artist_ID)
);
