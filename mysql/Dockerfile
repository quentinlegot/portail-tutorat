FROM mariadb:10.7.1

COPY . .
ENTRYPOINT "mysql -uroot -proot portail_tutorat < export.sql"
EXPOSE 3306