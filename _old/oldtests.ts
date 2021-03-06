/*test(
  'socket:method:basic',
  d => {
    let hasResult = false;
    const done = async () => {
      clearTimeout(timeout);
      services.forEach(x => x());
      await destroy();
      expect(hasResult).toBe(true);
      d();
    };
    const timeout = setTimeout(done, maxTimeout);
    const destroy = createBroker(broker => {
      broker.plugin(
        pluginSocketBroker({
          port
        })
      );
    });
    const services = [
      createSocket(`http://localhost:${port}`, async service => {
        const calculator = service.use<ICalculator>('calculator');
        try {
          const result = await calculator.multiply(2, 3);
          expect(result).toBe(6);
          hasResult = true;
        } catch (err) {
          expect({}).toBeNull();
        }
        done();
      }),
      createSocketService('calculator', `http://localhost:${port}`, service => {
        service.addMethod<number>('multiply', (x1: number, x2: number) => {
          return x1 * x2;
        });
      })
    ];
  },
  maxTimeout + 1000
);

const makeServer = (
  port: number,
  name: string,
  init: (service: IService) => void
) => {
  const destroy = createBroker(broker => {
    broker.plugin(
      pluginSocketBroker({
        port
      })
    );
    broker.local(name, init);
  });
  return destroy;
};*/

// log.enable();
/* test(
  'socket:method:reconnect',
  async d => {
    // Broker
    const broker = new Broker([pluginSocketBroker({ port: port + 1 })]);
    // Service
    const service = new Service('calculator', new LocalConnector(broker));
    service.addMethod<number>('multiply', (x1: number, x2: number) => {
      return x1 * x2;
    });
    const client = new ServiceClient(new LocalConnector(broker));
    /// Client
    const client = new ServiceClient(
      new SocketConnector(`http://localhost:${port + 1}`),
      { timeout: 1000 }
    );/
    const calc = client.use<ICalculator>('calculator');
    console.log('Client up');
    expect(await calc.multiply(5, 5)).toBe(25);
    d();
    client.on('connect', () => console.log('CONNECTED'));
    client.on('disconnect', () => console.log('DISCONNECTED'));
    client.on('timeout', () => console.log('TIMEOUT'));
    const calc = client.use<ICalculator>('calculator');
    console.log('Client up');
    let result = await calc.multiply(5, 5);
    console.log(result);
    destroy();
    await new Promise(yay => setTimeout(yay, 1000));
    result = await calc
      .multiply(6, 6)
      .catch(err => (console.log('Timeout') as any) || 'Timeout');
    console.log(result);
    await new Promise(yay => setTimeout(yay, 1000));
    d();*
  },
  maxTimeout + 30000
);
*/
/*test(
  'socket:method:error',
  d => {
    let hasResult = false;
    let hasErr = false;
    const done = async () => {
      clearTimeout(timeout);
      services.forEach(x => x());
      await destroy();
      expect(hasResult).toBe(false);
      expect(hasErr).toBe(true);
      d();
    };
    const timeout = setTimeout(done, maxTimeout);
    const destroy = createBroker(broker => {
      broker.plugin(
        pluginSocketBroker({
          port
        })
      );
    });
    const services = [
      createSocket(`http://localhost:${port}`, async service => {
        const calculator = service.use<ICalculator>('calculator');
        try {
          await calculator.multiply(2, 3);
          hasResult = true;
        } catch (err) {
          expect(err).toBeTruthy();
          hasErr = true;
        }
        done();
      }),
      createSocketService('calculator', `http://localhost:${port}`, service => {
        service.addMethod<number>('multiply', (x1: number, x2: number) => {
          throw new Error('Heyda');
        });
      })
    ];
  },
  maxTimeout + 1000
);

test(
  'socket:eventemitter:max',
  async d => {
    let hasResult = false;
    const done = async () => {
      clearTimeout(timeout);
      calc();
      await destroy();
      expect(hasResult).toBe(true);
      d();
    };
    const timeout = setTimeout(done, maxTimeout);
    const destroy = createBroker(broker => {
      broker.plugin(
        pluginSocketBroker({
          port
        })
      );
    });
    const calc = createSocketService(
      'calculator',
      `http://localhost:${port}`,
      service => {
        service.addSubscription('sub1', emit => {
          const interval = setInterval(() => emit('hi'), 100);
          return () => clearInterval(interval);
        });
      }
    );
    let max = 30;
    const create = () =>
      new Promise(yay => {
        const destroyClient = createSocket(
          `http://localhost:${port}`,
          async service => {
            const calculator = service.use<ICalculator>('calculator');
            try {
              calculator['sub1'];
              hasResult = true;
            } catch (err) {
              expect({}).toBeNull();
            }
            destroyClient();
            yay();
          }
        );
      });
    while (max > 0) {
      await create();
    }
  },
  maxTimeout + 1000
);

test(
  'socket:method:identity',
  d => {
    let hasResult = false;
    const done = async () => {
      clearTimeout(timeout);
      services.forEach(x => x());
      await destroy();
      expect(hasResult).toBe(true);
      d();
    };
    const timeout = setTimeout(done, maxTimeout);
    const destroy = createBroker(broker => {
      broker.plugin(
        pluginSocketBroker({
          port,
          getIdentity: () => ({ name: 'broker123' }),
          verifyClientIdentity: (identity: any) =>
            identity.accessToken === 'Bearer 12345'
        })
      );
    });
    const services = [
      createSocket(
        `http://localhost:${port}`,
        async service => {
          const calculator = service.use<ICalculator>('calculator');
          try {
            const result = await calculator.multiply(2, 3);
            expect(result).toBe(6);
            hasResult = true;
          } catch (err) {
            expect({}).toBeNull();
          }
        },
        {
          getIdentity: () => ({ accessToken: 'Bearer 12345' }),
          verifyBrokerIdentity: (identity: any) => identity.name === 'broker123'
        }
      ),
      createSocket(
        `http://localhost:${port}`,
        async service => {
          const calculator = service.use<ICalculator>('calculator');
          try {
            const result = await calculator.multiply(2, 3);
            expect(result).toBe(-1);
          } catch (err) {
            expect(err).toBeTruthy();
          }
        },
        {
          getIdentity: () => ({ accessToken: 'Bearer 123' }),
          verifyBrokerIdentity: (identity: any) => identity.name === 'broker123'
        }
      ),
      createSocketService(
        'calculator',
        `http://localhost:${port}`,
        service => {
          service.addMethod<number>('multiply', (x1: number, x2: number) => {
            return x1 * x2;
          });
        },
        {
          getIdentity: () => ({ accessToken: 'Bearer 12345' }),
          verifyBrokerIdentity: (identity: any) => identity.name === 'broker123'
        }
      )
    ];
  },
  maxTimeout + 1000
);

test(
  'socket:method:https',
  d => {
    let hasResult = false;
    const done = async () => {
      clearTimeout(timeout);
      services.forEach(x => x());
      await destroy();
      expect(hasResult).toBe(true);
      d();
    };
    const timeout = setTimeout(done, maxTimeout);
    const { privateKey, cert } = generateCertificate();
    const destroy = createBroker(broker => {
      broker.plugin(
        pluginSocketBroker({
          port,
          certficate: [privateKey, cert]
        })
      );
    });
    const services = [
      createSocket(`https://localhost:${port}`, async service => {
        const calculator = service.use<ICalculator>('calculator');
        try {
          const result = await calculator.multiply(2, 3);
          expect(result).toBe(6);
          hasResult = true;
        } catch (err) {
          expect({}).toBeNull();
        }
        done();
      }),
      createSocketService(
        'calculator',
        `https://localhost:${port}`,
        service => {
          service.addMethod<number>('multiply', (x1: number, x2: number) => {
            return x1 * x2;
          });
        }
      )
    ];
  },
  maxTimeout + 1000
);

/*

test(
  'socket:method:withclient',
  () => {
    return new Promise(yay => {
      let disco = false;
      const done = async () => {
        clearTimeout(timeout);
        await broker.destroy();
        expect(disco).toBe(true);
        yay();
      };
      const timeout = setTimeout(done, maxTimeout);
      const broker = createBroker([
        pluginSocketBroker({
          port: 9999
        })
      ]);
      const service1 = createService('calculator');
      service1.addMethod<number>('multiply', (x1: number, x2: number) => {
        return x1 * x2;
      });
      const client = createService('client');
      client.on('connect', async () => {
        const service = client.use<ICalculator>('calculator');
        try {
          const result = await service.multiply(2, 3);
          expect(result).toBe(6);
        } catch (err) {
          expect(err).toBeNull();
        }
        setTimeout(done);
      });
      client.on('disconnect', () => {
        disco = true;
      });
      socketClient('http://localhost:9999', service1);
      socketClient('http://localhost:9999', client);
    });
  },
  maxTimeout
);

test(
  'socket:identity:basic',
  () => {
    return new Promise(yay => {
      const done = async () => {
        clearTimeout(timeout);
        await broker.destroy();
        yay();
      };
      const timeout = setTimeout(done, maxTimeout);
      const broker = createBroker([
        pluginSocketBroker({
          port: 9999,
          getIdentity: () => ({ key: '12345' }),
          verifyClientIdentity: identity =>
            identity.key === 'calc' || identity.key === '54321'
        })
      ]);
      const service1 = createService('calculator');
      service1.addMethod<number>('multiply', (x1: number, x2: number) => {
        return x1 * x2;
      });
      const client = createService('client');
      socketClient('http://localhost:9999', service1, {
        getIdentity: () => ({ key: 'calc' })
      });
      socketClient('http://localhost:9999', client, {
        getIdentity: () => ({ key: '54321' }),
        verifyBrokerIdentity: identity => identity.key === '12345'
      });
      const client2 = createService('client');
      socketClient('http://localhost:9999', client2, {
        getIdentity: () => ({ key: '54321' }),
        verifyBrokerIdentity: identity => {
          if (identity.key === '1234') {
            return true;
          }
          return false;
        }
      });
      const client3 = createService('client');
      socketClient('http://localhost:9999', client3, {
        getIdentity: () => ({ key: '5432' }),
        verifyBrokerIdentity: identity => {
          return true;
        }
      });

      Promise.all([
        async () => {
          const service = client.use<ICalculator>('calculator');
          try {
            const result = await service.multiply(2, 3);
            expect(result).toBe(6);
          } catch (err) {
            expect(err).toBeNull();
          }
        },
        async () => {
          const service = client2.use<ICalculator>('calculator');
          try {
            const result = await service.multiply(2, 3);
            expect(result).toBe(false);
          } catch (err) {
            expect(err).toBeTruthy();
          }
        },
        async () => {
          const service = client3.use<ICalculator>('calculator');
          try {
            const result = await service.multiply(2, 3);
            expect(result).toBe(false);
          } catch (err) {
            expect(err).toBeTruthy();
          }
        }
      ]).then(() => setTimeout(done));
    });
  },
  maxTimeout
);
*/
