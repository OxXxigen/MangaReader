@ECHO OFF
REM ************************************************************
REM	*	Call chrome to package the extension
REM ************************************************************
;SET CHROME="%USERPROFILE%\AppData\Local\Google\Chrome\Application\chrome.exe"
SET CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"


IF NOT EXIST %CHROME% (
	ECHO Chrome.exe was not found.
	PAUSE
) ELSE (
	IF NOT EXIST ".\build" (
		MKDIR ".\build"
	)

	IF EXIST "%CD%\build\ReadMangaApp.pem" (
		REM build package with existing extension key
		%CHROME% --pack-extension="%CD%\src" --pack-extension-key="%CD%\build\ReadMangaApp.pem" --no-message-box
	) ELSE (
		REM build package and create new extension key
		%CHROME% --pack-extension="%CD%\src" --no-message-box
		move "%CD%\ReadMangaApp.pem" "%CD%\build\ReadMangaApp.pem"
	)

	IF EXIST "%CD%\ReadMangaApp.crx" (
		move /Y "%CD%\ReadMangaApp.crx" "%CD%\build\ReadMangaApp.crx"
	)
)
pause