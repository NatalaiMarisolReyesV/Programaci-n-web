document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('formulario');
  const widgetMensaje = document.getElementById('widgetMensaje');

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Obtener valores del formulario
    const materia = document.getElementById('materia').value.trim();
    const cal1 = parseFloat(document.getElementById('calificacion1').value);
    const cal2 = parseFloat(document.getElementById('calificacion2').value);
    const cal3 = parseFloat(document.getElementById('calificacion3').value);

    // 2. Operaciones matemáticas
    const sumaTotal = cal1 + cal2 + cal3;
    const promedio = sumaTotal / 3;

    // 3. Determinar mensaje según la calificación final (promedio)
    let mensaje = '';
    if (promedio >= 90 && promedio <= 100) {
      mensaje = 'Excelente';
    } else if (promedio >= 70 && promedio < 90) {
      mensaje = 'Bueno';
    } else if (promedio < 70) {
      mensaje = 'Insuficiente';
    }

    // 4. Mostrar el desglose completo en el DOM
    widgetMensaje.innerHTML = `
      Materia: ${materia}<br>
      Suma total: ${sumaTotal.toFixed(1)}<br>
      Calificación final: ${promedio.toFixed(1)}<br>
      Estatus: ${mensaje}
    `;
  });
});