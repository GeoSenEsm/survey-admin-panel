# Respondenci

Aby przejść do modułu `Respondenci`, wybierz odpowiednią zakładkę w bocznym panelu po lewej stronie ekranu
![alt text](imgs/turn_on.png)


W tym module możesz przeglądać, filtrować oraz eksportować dane o respondentach. Domyślnie widok pokazuje wszystkich respondentów w siatce. 

## Paginacja 

Na dole strony możesz nawigować pomiędzy stronami siatki z danymi oraz określić rozmiar strony. 

![alt text](imgs/pagination.png)

## Kolumny

W siatce dostępne są zawsze przynajmniej następujące kolumny z danymi:
- Nazwa użytkownika
- ID

Jeśli zdefiniowałeś ankietę początkową, to dla każdego pytania w ankiecie początkowej, będzie tutaj utworzona kolumna. Nagłówek tej kolumny to treść pytania, a wartości w poszczególnych komórkach to odpowiedzi udzielone przez respondentów. W naszym przykładzie w ankiecie początkowej utworzyłem pytanie "Płeć". 

![alt text](imgs/columns.png)

## Akcje

W siatce widoczna jest dodatkowa kolumna `Akcje`. Nie zawiera ona danych, a umożliwia wykonanie następujących czynności na respondencie:

- edycja,
- zmiana hasła
- przeglądanie wyników

![alt text](imgs/actions.png)

#### Edycja

Edycja danych respondenta polega na edycji odpowiedzi udzielonych przez niego w ankiecie początkowej. Z tego powodu, opcja ta jest dostępna **wyłącznie** jeśli ankieta początkowa została opublikowana. Po wciśnięciu ikony ołówka, wyświetli się formularz, który umoliwi edycję danych. 

![alt text](imgs/edit.png)

#### Zmiana hasła

Po wciśnięciu ikony klucza wyświetli się formularz zmiany hasła dla respondenta

![alt text](imgs/change_password.png)

#### Wyniki respondenta

Po wciśnięciu ikony z lupą, będziesz mógł wybrać, czy chcesz wyświetlić:
- odpowiedzi na ankiety
- dane lokalizacyjne na mapie
- dane z czujników

Wybranie którejś z tych opcji przekieruje cię do odpowiedniego moduły i ustawi w nim filtry tak, abyś mógł przeglądać dane dla wybranego respondenta. Więcej informacji znajdziesz w dokumencie poświęconym modułom `Wyniki`, `Czujniki temperatury`, `Mapa`
