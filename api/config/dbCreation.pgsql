-- brew update
-- brew install postgresql
-- postgres -D /usr/local/var/postgres || any other path
-- postgres -D path || to run the fucking server
-- remove file that make crash line 127
-- pg_ctl -D /Users/StanyaPalmaro/Documents/42/Matcha/api/db -l /usr/local/var/postgres/server.log restart || if pgadmin stinks
-- launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist || im guessing to quit cause background


CREATE DATABASE IF NOT EXISTS Test_DB;

\connect Test_DB;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    user_uuid uuid DEFAULT uuid_generate_v4 (),
    email text NOT NULL,
    username text NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    age integer NOT NULL,
    dobday integer NOT NULL,
    dobmonth integer NOT NULL,
    dobyear integer NOT NULL,
    password text NOT NULL,
    gender text NOT NULL,
    orientation text NOT NULL DEFAULT 'Both',
    description text NOT NULL ,
    location point,
    address text NOT NULL,
    lastConnected timestamp NOT NULL,
    profilePicture text,
    score integer NOT NULL DEFAULT 10,
    blocked text[] NOT NULL,
    reportedBy text[] NOT NULL, 
    firstConnection boolean NOT NULL DEFAULT TRUE,
    picture1 text,
    picture2 text,
    picture3 text,
    picture4 text,
    PRIMARY KEY (user_uuid)
);

CREATE TABLE interests(
    interest_uuid uuid DEFAULT uuid_generate_v4 (),
    interest text
);

CREATE TABLE user_interests(
    user_uuid uuid NOT NULL,
    interest_uuid uuid NOT NULL,
    PRIMARY KEY (user_uuid, interest_uuid),
    FOREIGN KEY (user_uuid) REFERENCES users (user_uuid) ON DELETE CASCADE
);

CREATE TABLE notifications(
    notif_uuid uuid DEFAULT uuid_generate_v4 (),
    notif_type text NOT NULL,
    notif_who text NOT NULL,
    notif_from text NOT NULL,
    notif_read text NOT NULL,
    notif_date timestamp NOT NULL,
    PRIMARY KEY (notif_uuid)
);

CREATE TABLE match(
    match_uuid uuid DEFAULT uuid_generate_v4 (),
    users text[] NOT NULL,
    match_ts timestamp,
    match_read boolean DEFAULT FALSE,
    PRIMARY KEY (match_uuid)
);

CREATE TABLE messages(
    msg_uuid uuid DEFAULT uuid_generate_v4 (),
    match_uuid uuid NOT NULL,
    msg_from text NOT NULL,
    msg_to text NOT NULL,
    msg_msg text NOT NULL,
    msg_ts timestamp,
    PRIMARY KEY (msg_uuid),
    FOREIGN KEY (match_uuid) REFERENCES match (match_uuid) ON DELETE CASCADE
);

CREATE TABLE views(
    views_uuid uuid DEFAULT uuid_generate_v4 (),
    views_current_user text NOT NULL,
    views_subject text NOT NULL,
    views_status text NOT NULL,
    PRIMARY KEY (views_uuid)
);



