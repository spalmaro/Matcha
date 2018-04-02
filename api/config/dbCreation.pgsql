-- brew update
-- brew install postgresql
-- mkdir db && chmod 0700 db || directory of DATABASE
-- initdb api/db
-- pg_ctl -D api/db/ -l logfile start
-- psql -d matcha (server)
-- Or, if you don't want/need a background service you can just run:
--   pg_ctl -D /usr/local/var/postgres start

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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
    lastconnected timestamp DEFAULT CURRENT_TIMESTAMP,
    profilepicture text,
    score integer NOT NULL DEFAULT 10,
    blocked text[],
    reportedBy text[], 
    firstconnection boolean DEFAULT TRUE,
    interests text[],
    picture1 text,
    picture2 text,
    picture3 text,
    picture4 text,
    online boolean DEFAULT true,
    PRIMARY KEY (user_uuid)
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
    match_read boolean DEFAULT true,
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
    expiration_ts timestamp DEFAULT current_timestamp + interval '1' day,
    PRIMARY KEY (user_uuid)
);

CREATE TABLE visit(
    visit_uuid uuid DEFAULT uuid_generate_v4 (),
    visit_current_user text NOT NULL,
    visit_subject text NOT NULL,
    PRIMARY KEY (visit_uuid)
);


