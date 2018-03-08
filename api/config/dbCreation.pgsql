-- brew update
-- brew install postgresql
-- mkdir db && chmod 0700 db || directory of DATABASE
-- postgres -D ~/Desktop/Matcha/api/db
-- initdb ~/Desktop/Matcha/api/db
-- pg_ctl -D /Users/lvalenti/Desktop/Matcha/api/db -l logfile start
-- psql -d matcha (server)
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
    description text,
    location point,
    address text,
    lastConnected timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profilePicture text,
    score integer NOT NULL DEFAULT 10,
    blocked text[],
    reportedBy text[], 
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
    match_ts timestamp default current_timestamp,
    match_read boolean DEFAULT FALSE,
    PRIMARY KEY (match_uuid)
);

CREATE TABLE messages(
    msg_uuid uuid DEFAULT uuid_generate_v4 (),
    match_uuid uuid NOT NULL,
    msg_from text NOT NULL,
    msg_to text NOT NULL,
    msg_msg text NOT NULL,
    msg_ts timestamp default current_timestamp,
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

CREATE TABLE password_reset(
    user_uuid uuid,
    activation_uuid uuid DEFAULT uuid_generate_v4 (),
    expiration_ts timestamp DEFAULT current_timestamp,
    PRIMARY KEY (user_uuid)
)


