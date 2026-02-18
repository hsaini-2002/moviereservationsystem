insert into auditorium (name) values
  ('Audi-1'),
  ('Audi-2'),
  ('Audi-3')
on conflict do nothing;

insert into seat (auditorium_id, row_label, seat_number)
select a.id, v.row_label, v.seat_number
from auditorium a
cross join (
  values
    ('A', 1), ('A', 2), ('A', 3), ('A', 4), ('A', 5), ('A', 6), ('A', 7), ('A', 8), ('A', 9), ('A', 10),
    ('B', 1), ('B', 2), ('B', 3), ('B', 4), ('B', 5), ('B', 6), ('B', 7), ('B', 8), ('B', 9), ('B', 10),
    ('C', 1), ('C', 2), ('C', 3), ('C', 4), ('C', 5), ('C', 6), ('C', 7), ('C', 8), ('C', 9), ('C', 10)
) as v(row_label, seat_number)
where a.name in ('Audi-1', 'Audi-2', 'Audi-3')
on conflict do nothing;
