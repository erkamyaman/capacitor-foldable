import { Foldable } from 'capacitor-foldable';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    Foldable.echo({ value: inputValue })
}
