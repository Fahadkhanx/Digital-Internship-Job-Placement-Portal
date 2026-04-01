FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY InternshipPortal.API.csproj ./
RUN dotnet restore InternshipPortal.API.csproj

COPY . .
RUN dotnet publish InternshipPortal.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "InternshipPortal.API.dll"]

