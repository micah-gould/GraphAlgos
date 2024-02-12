// <![CDATA[
import {
  addExercise,
  Digraph,
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
  const g = new Digraph()
  const n = 8
  for (let i = 0; i < n; i++) g.vertex()
  g.verts().forEach((v) => {
    v.d = ''
    v.f = ''
    v.π = ''
  })

  // Add edges
  let target = 15
  while (target > 0) {
    const [a, b] = sim.randDistinctInts(2, 0, n - 1)
    const v = g.verts()[a]
    const w = g.verts()[b]
    if (g.findEdge(v, w) === undefined && g.findEdge(w, v) === undefined) {
      g.edge(v, w)
      target--
    }
  }

  const vars = sim.add(0, 0, new Frame())
  vars.sorted = new Seq()
  const sorts = []
  g.layout(sim, 1, 0.5, 15, 15)

  let time = 0

  yield sim.start(state)
  g.verts()[0].color = 'aquamarine'
  yield * visit(g.verts()[0])
  for (const u of g.verts()) {
    if (u.color === 'lightsteelblue') {
      yield sim.ask(
        u,
        'Select the next vertex.',
        'If there is more than one correct choice, choose the first one in alphabetical order'
      )
      u.color = 'aquamarine'
      yield * visit(u, u)
    }
  }

  function * visit (vert, from) {
    time++
    yield sim.set(vert.d, time, 'Update the d value')
    vert.d = time
    const adjVerts = g.adjacent(vert)
    for (const v of adjVerts) {
      if (v.color === 'lightsteelblue') {
        yield sim.ask(
          v,
          'Select the next vertex.',
          'If there is more than one correct choice, choose the first one in alphabetical order'
        )
        v.color = 'aquamarine'
        yield sim.set(v.π, vert.toString(), 'Update the π value')
        v.π = vert.toString()
        yield * visit(v, from)
      }
    }
    time++
    yield sim.set(vert.f, time, 'Update the f value')
    vert.f = time
    vert.color = 'lightpink'
    sorts.unshift(vert.toString())
    for (let i = 0; i < sorts.length; i++) {
      vars.sorted[i] = sorts[i]
    }
  }

  // Coloring of back edges
  const backEdges = g.edges().filter(edge => edge.from.d > edge.to.d && edge.from.f < edge.to.f)
  let usedEdges = [...backEdges]
  yield sim.askAll(backEdges, 'Select a back edge', sim.blank(), edge => { edge.color = 'pink' })

  // Coloring of cross edges
  const crossEdges = g.edges().filter(edge => edge.from.d > edge.to.d && edge.from.f > edge.to.f && !usedEdges.includes(edge))
  usedEdges = usedEdges.concat(crossEdges)
  yield sim.askAll(crossEdges, 'Select a cross edge', sim.blank(), edge => { edge.color = 'rgba(255, 255, 255, 0)' })

  // Coloring of forward edges
  const forwardEdges = g.edges().filter(edge => edge.to.π.toString() !== edge.from.toString() && !usedEdges.includes(edge))
  usedEdges = usedEdges.concat(forwardEdges)
  yield sim.askAll(forwardEdges, 'Select a forward edge', sim.blank(), edge => { edge.color = 'blue' })

  // Coloring of the rest of the edges
  g.edges().filter(edge => !usedEdges.includes(edge)).forEach(edge => { edge.color = 'firebrick' })
})
// ]]>
