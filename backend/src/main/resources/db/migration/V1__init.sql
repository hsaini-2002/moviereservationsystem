create table if not exists app_user (
  id bigserial primary key,
  name varchar(120) not null,
  email varchar(190) not null unique,
  password_hash varchar(255) not null,
  role varchar(30) not null,
  created_at timestamptz not null default now()
);

create table if not exists genre (
  id bigserial primary key,
  name varchar(80) not null unique
);

create table if not exists movie (
  id bigserial primary key,
  title varchar(200) not null,
  description text not null,
  poster_url text,
  genre_id bigint not null references genre(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists auditorium (
  id bigserial primary key,
  name varchar(100) not null unique,
  created_at timestamptz not null default now()
);

create table if not exists seat (
  id bigserial primary key,
  auditorium_id bigint not null references auditorium(id) on delete cascade,
  row_label varchar(10) not null,
  seat_number int not null,
  unique (auditorium_id, row_label, seat_number)
);

create table if not exists showtime (
  id bigserial primary key,
  movie_id bigint not null references movie(id) on delete cascade,
  auditorium_id bigint not null references auditorium(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  price_cents int not null,
  created_at timestamptz not null default now()
);

create table if not exists reservation (
  id bigserial primary key,
  user_id bigint not null references app_user(id) on delete cascade,
  showtime_id bigint not null references showtime(id) on delete cascade,
  status varchar(30) not null,
  total_amount_cents int not null,
  created_at timestamptz not null default now()
);

create table if not exists reservation_seat (
  reservation_id bigint not null references reservation(id) on delete cascade,
  showtime_id bigint not null references showtime(id) on delete cascade,
  seat_id bigint not null references seat(id),
  primary key (reservation_id, seat_id),
  unique (showtime_id, seat_id)
);

insert into genre (name) values
  ('Action'), ('Drama'), ('Comedy'), ('Sci-Fi')
on conflict do nothing;
