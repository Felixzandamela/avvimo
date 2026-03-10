function dividirValor(total, lugares, min, max) {
  const valores = new Array(lugares).fill(0);
  let restante = total - lugares * min;

  // Atribuir valores aleatórios para os lugares
  for (let i = 0; i < lugares; i++) {
    const valor = Math.floor(Math.random() * (max - min + 2)) + min;
    if (restante > 0) {
      const adicional = Math.min(restante, valor - min);
      valores[i] = valor + adicional;
      restante -= adicional;
    } else {
      valores[i] = valor;
    }
  }

  return valores;
}



const total = 10000;
const lugares = 70;
const min = 50;
const max = 300;

const valores = dividirValor(total, lugares, min, max);
console.log(valores);