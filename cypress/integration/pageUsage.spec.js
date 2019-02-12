import switcherooTests from './switcherooTests';

describe('Switcheroo with HTML page server response', function() {
  switcherooTests('http://localhost:8080/page.html');
});