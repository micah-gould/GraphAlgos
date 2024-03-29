// <![CDATA[
import {
  addExercise,
  Graph,
  Frame,
  Seq /* and others as needed */
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

  const vars = sim.add(0, 0, new Frame())
  vars.queue = new Seq()
  vars.queue[0] = 'A'

  const processingVertices = [g.verts()[0]]
  yield sim.start(state)
  g.verts()[0].color = 'aquamarine'

  while (processingVertices.length > 0) {
    vars.queue.length = 1
    for (let i = 0; i < processingVertices.length; i++) {
      vars.queue[i] = processingVertices[i].toString()
    }
    const u = processingVertices.shift()
    const adjVerts = g.adjacent(u)
    for (const v of adjVerts) {
      if (v.color === 'lightsteelblue') {
        yield sim.ask(
          v,
          'Select the next vertex.',
          'If there is more than one correct choice, choose the first one in alphabetical order'
        )
        v.color = 'aquamarine'
        v.d = u.d + 1
        v.π = u.toString()
        processingVertices.push(v)
        vars.queue[vars.queue.length] = v.toString()
      }
    }
    u.color = 'lightpink'
  }
})
// ]]>
