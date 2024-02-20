// <![CDATA[
import {
  addExercise,
  Graph /* and others as needed */
} from '../codecheck-tracer/script/codecheck_tracer.js' // Update to correct filepath
addExercise(function * (sim, state) {
  // TODO Eliminate
  if (state === undefined) {
    state = { seed: sim.randSeed() }
  } else {
    sim.randSeed(state.seed)
  }
  // Add vertices
  const g = new Graph()
  const n = 6
  for (let i = 0; i < n; i++) g.vertex()
  g.verts().forEach((v) => {
    v.d = v === g.verts()[0] ? 0 : '∞'
    v.π = ''
  })

  // Add edges
  for (let i = 0; i < n - 1; i++) g.edge(g.verts()[i], g.verts()[i + 1])
  let target = 5
  while (target > 0) {
    const [a, b] = sim.randDistinctInts(2, 0, n - 1).sort((a, b) => a - b)
    const v = g.verts()[a]
    const w = g.verts()[b]
    if (g.findEdge(v, w) === undefined) {
      g.edge(v, w)
      target--
    }
  }

  g.layout(sim, 1, 0.5, 15, 15)
  yield sim.start(state)

  yield sim.askAll(item => { item.color = 'pink' }, [...g.verts()].splice(0, 3))
  yield sim.askAll(item => { item.color = 'red' }, [...g.verts()].splice(3))
  yield sim.askAll(item => { item.color = 'pink' }, g.edges())
})
// ]]>
