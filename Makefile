dev: destroy build up logs

# for wsl2
dev-v1: destroy start-permission build up logs end-permission
test: start-permission

build:
	@COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build $(c)
destroy:
	@docker-compose down -v $(c)
up:
	@docker-compose up -d $(c)
up-db:
	@docker-compose -f docker-compose.yml up -d db $(c)
logs:
	@docker-compose logs --tail=100 -f $(c)
down:
	@docker-compose down $(c)
start-permission:
	-sudo chmod -R 777 pg-data mssql-data
end-permission:
	-sudo chmod -R 777 pg-data mssql-data
